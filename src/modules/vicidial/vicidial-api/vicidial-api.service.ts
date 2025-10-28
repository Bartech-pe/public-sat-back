import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { VicidialUserDto } from '@modules/user/dto/vicidial-user.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { vicidialConfig } from 'config/env';

interface ParsedResponse {
  DateTimeString?: string;
  DateTime?: Date;
  channel?: string;
  agentChannel?: string;
  [key: string]: any;
}

@Injectable()
export class VicidialApiService {
  private readonly urlNonAgentApi = `${vicidialConfig.host}/vicidial/non_agent_api.php`;
  private readonly urlAgentApi = `${vicidialConfig.host}/agc/api.php`;
  private readonly vicidialApi = `${vicidialConfig.host}/agc/vicidial.php`;
  private readonly managerSendApi = `${vicidialConfig.host}/agc/manager_send.php`;
  private readonly vdcDbQueryApi = `${vicidialConfig.host}/agc/vdc_db_query.php`;
  private readonly user = vicidialConfig.user;
  private readonly pass = vicidialConfig.pass;

  async createAgent(dto: VicidialUserDto): Promise<any> {
    const payload = new URLSearchParams({
      version: '2.14',
      source: 'crm',
      user: this.user,
      pass: this.pass,
      function: 'add_user',
      agent_user: dto.username,
      agent_pass: dto.userPass,
      agent_user_level: dto.userLevel.toString(),
      agent_full_name: dto.fullname,
      agent_user_group: dto.userGroup,
      agent_phone_login: dto.phoneLogin,
      agent_phone_pass: dto.phonePass,
    });

    const res = await axios.post(this.urlNonAgentApi, payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = res.data;
    const parts = data.trim().split('|');

    if (data.startsWith('ERROR') && !parts[0].includes('USER ALREADY EXISTS')) {
      throw new InternalServerErrorException(
        'Ocurrió un error al guardar el usuario vicidial',
      );
    }

    await this.createOrUpdatePhoneAgent(dto);

    await this.updateAgent(dto);

    return { data };
  }

  async updateAgent(dto: VicidialUserDto): Promise<any> {
    const payload = new URLSearchParams({
      version: '2.14',
      source: 'crm',
      user: this.user,
      pass: this.pass,
      function: 'update_user',
      agent_user: dto.username,
      agent_pass: dto.userPass,
      phone_login: dto.phoneLogin,
      phone_pass: dto.phonePass,
      agent_user_level: dto.userLevel.toString(),
      agent_full_name: dto.fullname,
      agent_user_group: dto.userGroup,
    });

    const response = await axios.get(
      `${this.urlNonAgentApi}?${payload.toString()}`,
    );
    const data = response.data;

    const parts = data.trim().split('|');

    if (parts.length <= 1 || parts[0].startsWith('ERROR')) {
      // Manejo de error o respuesta inesperada
      throw new Error('No se pudo actualizar el agente.');
    }

    return { data };
  }

  async createOrUpdatePhoneAgent(dto: VicidialUserDto): Promise<any> {
    const baseParams = {
      version: '2.14',
      source: 'crm',
      user: this.user,
      pass: this.pass,
      server_ip: vicidialConfig.privateIP,
    };

    const createParams = new URLSearchParams({
      ...baseParams,
      function: 'add_phone',
      extension: dto.phoneLogin,
      dialplan_number: dto.phoneLogin,
      voicemail_id: dto.phoneLogin,
      phone_login: dto.phoneLogin,
      phone_pass: dto.phonePass,
      protocol: 'SIP',
      registration_password: dto.phonePass,
      phone_full_name: dto.fullname,
      local_gmt: '-5.00',
      outbound_cid: dto.phoneLogin,
    });

    let response = await axios.get(
      `${this.urlNonAgentApi}?${createParams.toString()}`,
    );
    let data = response.data.trim();

    let parts = data.split('|');

    if (data.startsWith('ERROR') && parts[0].includes('PHONE ALREADY EXISTS')) {
      console.warn(
        `El teléfono ${dto.phoneLogin} ya existe, intentando actualizar...`,
      );

      const updateParams = new URLSearchParams({
        ...baseParams,
        function: 'update_phone',
        extension: dto.phoneLogin,
        phone_pass: dto.phonePass,
        phone_full_name: dto.fullname,
        voicemail_id: dto.phoneLogin,
        registration_password: dto.phonePass,
        outbound_cid: dto.phoneLogin,
      });

      response = await axios.get(
        `${this.urlNonAgentApi}?${updateParams.toString()}`,
      );
      data = response.data.trim();

      parts = data.split('|');

      if (data.startsWith('ERROR')) {
        throw new InternalServerErrorException(
          'No se pudo actualizar el teléfono vicidial',
        );
      }

      return { action: 'updated', data };
    }

    if (data.startsWith('ERROR')) {
      throw new InternalServerErrorException(
        'Ocurrió un error al guardar el teléfono vicidial',
      );
    }

    return { action: 'created', data };
  }

  async agentLogin(
    user: string,
    pass: string,
    phoneLogin: string,
    phonePass: string,
    campaignId: string,
  ) {
    const payload = new URLSearchParams({
      phone_login: phoneLogin,
      phone_pass: phonePass,
      VD_login: user,
      VD_pass: pass,
      VD_campaign: campaignId,
    });

    try {
      const res = await axios.post(this.vicidialApi, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
 
      const data = res.data;
      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Error:', error.response?.data || error.message);
    }
  }

  async agentRelogin(
    user: string,
    pass: string,
    campaign: string,
    sessionName: string,
    exten: string,
    phoneLogin: string,
    extension: string,
    campaignCID: string,
    protocol: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user,
      pass,
      campaign,
      exten,
      ACTION: 'OriginateVDRelogin',
      format: 'text',
      channel: extension,
      queryCID: this.buildQueryCID(user, 'AC', 'agcW'),
      ext_context: 'default',
      ext_priority: '1',
      extension: phoneLogin,
      protocol: protocol,
      enable_sipsak_messages: '0',
      allow_sipsak_messages: '0',
      outbound_cid: campaignCID,
    });

    try {
      const res = await axios.post(this.managerSendApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });

      const data = res.data;

      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async changeIngroups(
    user: string,
    pass: string,
    phoneLogin: string,
    campaignId: string,
    sessionName: string,
    inboundGroups: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'regCLOSER',
      format: 'text',
      user,
      pass,
      comments: '',
      closer_blended: '0',
      campaign: campaignId,
      qm_phone: '',
      qm_extension: phoneLogin,
      dial_method: 'INBOUND_MAN',
      closer_choice: inboundGroups,
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new Error(
        'No se pudo configurar los grupos de cierre para el agente.',
      );
    }
  }

  async setAgentReady(
    user: string,
    pass: string,
    phoneLogin: string,
    campaignId: string,
    sessionName: string,
    agentLogId: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'VDADready',
      user,
      pass,
      stage: 'CLOSER',
      agent_log_id: agentLogId,
      agent_log: '',
      wrapup: '',
      campaign: campaignId,
      dial_method: 'INBOUND_MAN',
      comments: '',
      qm_extension: phoneLogin,
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = res.data;
      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Error:', error.response?.data || error.message);
    }
  }

  async setAgentPause(
    user: string,
    pass: string,
    phoneLogin: string,
    campaignId: string,
    sessionName: string,
    agentLogId: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'VDADpause',
      user,
      pass,
      stage: 'PAUSED',
      agent_log_id: agentLogId,
      agent_log: '',
      wrapup: '',
      campaign: campaignId,
      dial_method: 'INBOUND_MAN',
      comments: '',
      qm_extension: phoneLogin,
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = res.data;
      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Error:', error.response?.data || error.message);
    }
  }

  async setAgentLogout(
    user: string,
    pass: string,
    phoneLogin: string,
    campaignId: string,
    sessionName: string,
    agentLogId: string,
    confExten: string,
    protocol: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'userLOGout',
      format: 'text',
      user: user,
      pass: pass,
      campaign: campaignId,
      conf_exten: confExten,
      extension: phoneLogin,
      protocol: protocol,
      agent_log_id: agentLogId,
      no_delete_sessions: '1',
      enable_sipsak_messages: '0',
      LogouTKicKAlL: '1',
      ext_context: 'default',
      qm_extension: phoneLogin,
      stage: 'NORMAL',
      pause_trigger: '',
      dial_method: 'INBOUND_MAN',
      pause_max_url_trigger: '',
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return res.data;
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Error:', error.response?.data || error.message);
    }
  }

  async pauseAgent(agentUser: string) {
    const payload = new URLSearchParams({
      version: '2.14',
      source: 'test',
      user: this.user,
      pass: this.pass,
      agent_user: agentUser,
      function: 'external_pause',
      value: 'PAUSE',
    });

    const response = await axios.get(
      `${this.urlAgentApi}?${payload.toString()}`,
    );

    const data = response.data;

    const parts = data.trim().split('|');

    if (parts.length <= 1 || parts[0].startsWith('ERROR')) {
      // Manejo de error o respuesta inesperada
      throw new Error('No se pudo pausar el agente.');
    }

    return { data };
  }

  async pauseCodeAgent(
    pauseCode: string = '',
    user: string,
    pass: string,
    phoneLogin: string,
    campaignId: string,
    sessionName: string,
    agentLogId: string,
    phoneIp: string,
    protocol: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user: user,
      pass: pass,
      ACTION: 'PauseCodeSubmit',
      format: 'text',
      status: pauseCode,
      agent_log_id: agentLogId,
      campaign: campaignId,
      extension: phoneLogin,
      protocol: protocol,
      phone_ip: phoneIp,
      enable_sipsak_messages: '0',
      stage: '1',
      campaign_cid: '',
      auto_dial_level: '1.0',
      MDnextCID: '',
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = res.data;

      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Error:', error.response?.data || error.message);
    }
  }

  async resumeAgent(agentUser: string) {
    const payload = new URLSearchParams({
      version: '2.14',
      source: 'test',
      user: this.user,
      pass: this.pass,
      agent_user: agentUser,
      function: 'external_pause',
      value: 'RESUME',
    });

    const response = await axios.get(
      `${this.urlAgentApi}?${payload.toString()}`,
    );

    const data = response.data;

    const parts = data.trim().split('|');

    if (parts.length <= 1 || parts[0].startsWith('ERROR')) {
      // Manejo de error o respuesta inesperada
      throw new Error('No se pudo despausar el agente.');
    }

    return { data };
  }

  async transferCall(
    user: string,
    pass: string,
    campaignId: string,
    sessionName: string,
    agentExten: string,
    confExten: string,
    uniqueId: string,
    leadId: string,
    channel: string,
    callerid: string,
    secondS: string = '0',
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user,
      pass,
      campaign: campaignId,
      exten: agentExten,
      ACTION: 'RedirectVD',
      format: 'text',
      channel: channel,
      queryCID: this.buildQueryCID(user, 'XB'),
      ext_context: 'default',
      ext_priority: '1',
      auto_dial_level: '1',
      uniqueid: uniqueId,
      lead_id: leadId,
      secondS: secondS,
      session_id: confExten,
      nodeletevdac: '0',
      preset_name: '',
      CalLCID: callerid,
      customerparked: '0',
    });

    try {
      const res = await axios.post(this.managerSendApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });

      const data = res.data;

      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async transferSurvey(
    presetName: string,
    user: string,
    pass: string,
    campaignId: string,
    sessionName: string,
    confExten: string,
    leadId: string,
    channel: string,
    vendorLeadCode: string,
    calleridnum: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user,
      pass,
      ACTION: 'Originate',
      format: 'text',
      channel: channel,
      queryCID: this.buildQueryCIDSurvey(leadId),
      exten: confExten,
      ext_context: 'default',
      ext_priority: '1',
      outbound_cid: calleridnum,
      usegroupalias: '0',
      preset_name: presetName,
      campaign: campaignId,
      account: '',
      agent_dialed_number: '1',
      agent_dialed_type: 'XFER_3WAY',
      lead_id: leadId,
      stage: '0',
      alertCID: '0',
      cid_lock: '0',
      session_id: confExten,
      call_variables: `__vendor_lead_code=${vendorLeadCode},__lead_id=${leadId}`,
    });

    try {
      const res = await axios.post(this.managerSendApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });

      const data = res.data;

      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async hangupCall(
    user: string,
    pass: string,
    phoneLogin: string,
    campaignId: string,
    sessionName: string,
    channel: string,
    confExten: string,
    inbounds: string,
    nextCID: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'Hangup',
      format: 'text',
      user: user,
      pass: pass,
      channel: channel,
      call_server_ip: vicidialConfig.privateIP,
      queryCID: this.buildQueryCID(user, 'HL', 'vdcW'),
      auto_dial_level: '1',
      CalLCID: nextCID,
      secondS: '6',
      exten: confExten,
      campaign: inbounds,
      stage: 'CALLHANGUP',
      nodeletevdac: '',
      log_campaign: campaignId,
      qm_extension: phoneLogin,
    });

    const response = await axios.get(
      `${this.urlAgentApi}?${payload.toString()}`,
    );
    const data = response.data;
  }

  async endCall(
    user: string,
    pass: string,
    campaignId: string,
    sessionName: string,
    uniqueId: string,
    leadId: string,
    listId: string,
    phoneNumber: string,
    extension: string,
    channel: string,
    confExten: string,
    agentLogId: string,
    callerId: string,
    agentChannel: string,
    protocol: string,
  ) {
    const payload = new URLSearchParams({
      format: 'text',
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'manDiaLlogCaLL',
      stage: 'end',
      uniqueid: uniqueId,
      user: user,
      pass: pass,
      campaign: campaignId,
      lead_id: leadId,
      list_id: listId,
      length_in_sec: '0',
      phone_code: '1',
      phone_number: phoneNumber,
      exten: extension,
      channel: channel,
      start_epoch: '0',
      auto_dial_level: '1',
      VDstop_rec_after_each_call: '1',
      conf_silent_prefix: '5',
      protocol: protocol,
      extension: extension,
      ext_context: 'default',
      conf_exten: confExten,
      user_abb: user.repeat(4),
      agent_log_id: agentLogId,
      MDnextCID: callerId, // puede venir de vicidial_auto_calls
      inOUT: 'IN',
      alt_dial: 'MAIN',
      DB: '0',
      agentchannel: agentChannel,
      conf_dialed: '0',
      leaving_threeway: '0',
      hangup_all_non_reserved: '1',
      blind_transfer: '0',
      dial_method: 'INBOUND_MAN',
      nodeletevdac: '',
      alt_num_status: '0',
      qm_extension: extension,
      called_count: '1',
      leave_3way_start_recording_trigger: '0',
      leave_3way_start_recording_filename: '',
      channelrec: '',
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new Error(
        'No se pudo configurar los grupos de cierre para el agente.',
      );
    }
  }

  async sendParkAction(
    putOn: boolean,
    user: string,
    pass: string,
    campaignId: string,
    sessionName: string,
    confExten: string,
    uniqueId: string,
    leadId: string,
    extension: string,
    channel: string,
    callerId: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user: user,
      pass: pass,
      ACTION: putOn ? 'RedirectToPark' : 'RedirectFromPark',
      format: 'text',
      channel: channel,
      call_server_ip: vicidialConfig.privateIP,
      queryCID: this.buildQueryCID(user, 'LP', 'vdcW'),
      exten: putOn ? '8301' : confExten,
      ext_context: 'default',
      ext_priority: '1',
      extenName: 'park',
      parkedby: extension,
      session_id: confExten,
      CalLCID: callerId,
      uniqueid: uniqueId,
      lead_id: leadId,
      campaign: campaignId,
      group_id: 'colain',
    });

    try {
      const res = await axios.post(this.managerSendApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new Error(
        'No se pudo configurar los grupos de cierre para el agente.',
      );
    }
  }

  async callFromPark(
    user: string,
    pass: string,
    campaignId: string,
    sessionName: string,
    uniqueId: string,
    leadId: string,
    extension: string,
    channel: string,
    confExten: string,
    callerId: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user: user,
      pass: pass,
      ACTION: 'RedirectFromPark',
      format: 'text',
      channel: channel,
      call_server_ip: vicidialConfig.privateIP,
      queryCID: this.buildQueryCID(user, 'LP', 'vdcW'),
      exten: extension,
      ext_context: 'default',
      ext_priority: '1',
      extenName: 'park',
      parkedby: extension,
      session_id: confExten,
      CalLCID: callerId,
      uniqueid: uniqueId,
      lead_id: leadId,
      campaign: campaignId,
      group_id: 'colain',
    });

    try {
      const res = await axios.post(this.managerSendApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });
      return res.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new Error(
        'No se pudo configurar los grupos de cierre para el agente.',
      );
    }
  }

  async checkVdc(
    user: string,
    pass: string,
    campaign: string,
    sessionName: string,
    confExten: string,
  ): Promise<
    | {
        status?: string;
        pauseCode?: string;
        channel?: string;
        agentChannel?: string;
      }
    | undefined
  > {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user,
      pass,
      client: 'vdc',
      conf_exten: confExten,
      auto_dial_level: '1',
      campagentstdisp: 'NO',
      campaign,
      live_call_seconds: '0',
      check_for_answer: '0',
      dead_count: '0',
    });

    const url = `${vicidialConfig.host}/agc/conf_exten_check.php`;

    try {
      const res = await axios.post(url, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });

      // Parseamos la respuesta
      const rawResponse = res.data;

      const parsed: ParsedResponse = rawResponse
        .split('|')
        .map((part) => part.trim())
        .reduce(
          (acc, part) => {
            if (part.includes(':')) {
              const [key, ...rest] = part.split(':'); // soporta valores con ":"
              const value = rest.join(':').trim();

              if (key.trim().toLowerCase() === 'datetime') {
                acc.DateTimeString = value; // guardamos como string
                acc.DateTime = new Date(value.replace(' ', 'T')); // convertimos a Date ISO
              } else {
                acc[key.trim()] = value ?? '';
              }
            } else if (part.includes('~')) {
              const channels = part
                .split('~')
                .map((p) => p.trim())
                .filter((p) => p && p != '');
              acc['channel'] = channels.find((c: string) =>
                c.startsWith('SIP/inmagna'),
              );
              acc['agentChannel'] = channels.find(
                (c: string) => !c.startsWith('SIP/inmagna'),
              );
            } else {
              // 💡 Manejo de datos sueltos (sin ":" ni "~")
              if (part) {
                if (!acc.extra) acc.extra = [];
                acc.extra.push(part);
              }
            }
            return acc;
          },
          {} as Record<string, any>,
        );

      return parsed.Status
        ? {
            status: parsed.Status,
            pauseCode: undefined,
            channel: parsed.channel,
            agentChannel: parsed.agentChannel,
          }
        : undefined;
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async checkINCOMING(
    user: string,
    pass: string,
    phoneLogin: string,
    campaignId: string,
    sessionName: string,
    agentLogId: string,
    confExten: string,
    stage: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      user,
      pass,
      orig_pass: pass,
      campaign: campaignId,
      ACTION: 'VDADcheckINCOMING',
      agent_log_id: agentLogId,
      phone_login: phoneLogin,
      agent_email: '',
      conf_exten: confExten,
      camp_script: '',
      in_script: '',
      customer_server_ip: '',
      exten: phoneLogin,
      original_phone_login: phoneLogin,
      phone_pass: pass,
      VDRP_stage: stage,
      previous_agent_log_id: agentLogId,
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = res.data;
      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Error:', error.response?.data || error.message);
    }
  }

  async updateDispo(
    user: string,
    pass: string,
    campaignId: string,
    sessionName: string,
    phoneLogin: string,
    confExten: string,
    uniqueId: string,
    leadId: string,
    agentLogId: string,
    listId: string,
    phoneNumber: string,
    dispoChoice: string,
    stage: string,
    nextCID: string,
  ) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'updateDISPO',
      format: 'text',
      user,
      pass,
      orig_pass: pass,
      dispo_choice: dispoChoice,
      lead_id: leadId,
      campaign: campaignId,
      auto_dial_level: '1',
      agent_log_id: agentLogId,
      CallBackDatETimE: '',
      list_id: listId,
      recipient: '',
      use_internal_dnc: 'N',
      use_campaign_dnc: 'N',
      MDnextCID: nextCID,
      stage: stage,
      vtiger_callback_id: '0',
      phone_number: phoneNumber,
      phone_code: '1',
      dial_method: 'INBOUND_MAN',
      uniqueid: uniqueId,
      CallBackLeadStatus: '',
      comments: '',
      custom_field_names: '|',
      call_notes: '',
      dispo_comments: '',
      cbcomment_comments: '',
      qm_dispo_code: '',
      email_enabled: '0',
      recording_id: '',
      recording_filename: '',
      called_count: '1',
      parked_hangup: '0',
      phone_login: phoneLogin,
      agent_email: '',
      conf_exten: confExten,
      camp_script: '',
      in_script: '',
      customer_server_ip: '',
      exten: phoneLogin,
      original_phone_login: phoneLogin,
      phone_pass: pass,
      callback_gmt_offset: '',
      callback_timezone: '',
      customer_sec: '7',
    });

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });

      const data = res.data;

      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  private buildQueryCID(user: string, prefix: string, sufix?: string) {
    const random = sufix ?? Math.random().toString(36).substring(2, 6); // 4 chars aleatorios
    const epoch = Math.floor(Date.now() / 1000);
    return `${prefix}${random}${epoch}${user.repeat(4)}`;
  }

  private buildQueryCIDSurvey(leadId: string) {
    const epoch = Math.floor(Date.now() / 1000);
    return `DC${epoch}W0000000${leadId}W`;
  }
}
