import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { VicidialUserDto } from '@modules/user/dto/vicidial-user.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { vicidialConfig } from 'config/env';

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
    const queryParams = new URLSearchParams();
    queryParams.append('version', '2.14');
    queryParams.append('source', 'crm');
    queryParams.append('user', this.user);
    queryParams.append('pass', this.pass);
    queryParams.append('function', 'add_user');
    queryParams.append('agent_user', dto.username);
    queryParams.append('agent_pass', dto.userPass);
    queryParams.append('agent_user_level', dto.userLevel.toString());
    queryParams.append('agent_full_name', dto.fullname);
    queryParams.append('agent_user_group', dto.userGroup);
    queryParams.append('agent_phone_login', dto.phoneLogin);
    queryParams.append('agent_phone_pass', dto.phonePass);

    const url = `${this.urlNonAgentApi}?${queryParams.toString()}`;
    const res = await axios.post(url, queryParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('res', res.data);

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
    const queryParams = new URLSearchParams();
    queryParams.append('version', '2.14');
    queryParams.append('source', 'crm');
    queryParams.append('user', this.user);
    queryParams.append('pass', this.pass);
    queryParams.append('function', 'update_user');
    queryParams.append('agent_user', dto.username);
    queryParams.append('agent_pass', dto.userPass);
    queryParams.append('phone_login', dto.phoneLogin);
    queryParams.append('phone_pass', dto.phonePass);
    queryParams.append('agent_user_level', dto.userLevel.toString());
    queryParams.append('agent_full_name', dto.fullname);
    queryParams.append('agent_user_group', dto.userGroup);

    const url = `${this.urlNonAgentApi}?${queryParams.toString()}`;

    const response = await axios.get(url);
    const data = response.data;

    const parts = data.trim().split('|');

    console.log('data', data);

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
      phone_full_name: dto.phoneLogin,
      local_gmt: '-5.00',
      outbound_cid: '5551234567',
    });

    let response = await axios.get(
      `${this.urlNonAgentApi}?${createParams.toString()}`,
    );
    let data = response.data.trim();

    console.log('data', data);

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
        phone_full_name: dto.phoneLogin,
        voicemail_id: dto.phoneLogin,
        registration_password: dto.phonePass,
        outbound_cid: '5551234567',
      });

      response = await axios.get(
        `${this.urlNonAgentApi}?${updateParams.toString()}`,
      );
      data = response.data.trim();

      console.log('data', data);

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

  async agentLogin(user, pass, phoneLogin, phonePass, campaign) {
    const payload = new URLSearchParams({
      phone_login: phoneLogin,
      phone_pass: phonePass,
      VD_login: user,
      VD_pass: pass,
      VD_campaign: campaign,
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
      protocol: 'SIP',
      enable_sipsak_messages: '0',
      allow_sipsak_messages: '0',
      outbound_cid: campaignCID,
    });

    try {
      const res = await axios.post(this.managerSendApi, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      });

      console.log('resRelogin', res);

      const data = res.data;

      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async hangupCall(agentUser: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('source', 'crm');
    queryParams.append('user', this.user);
    queryParams.append('pass', this.pass);
    queryParams.append('function', 'external_hangup');
    queryParams.append('agent_user', agentUser);
    queryParams.append('value', '1');

    const response = await axios.get(
      `${this.urlAgentApi}?${queryParams.toString()}`,
    );
    const data = response.data;
  }

  async changeIngroups(user, pass, phoneLogin, campaign, sessionName) {
    const payload = new URLSearchParams({
      server_ip: vicidialConfig.privateIP,
      session_name: sessionName,
      ACTION: 'regCLOSER',
      format: 'text',
      user,
      pass,
      comments: '',
      closer_blended: '0',
      campaign: campaign,
      qm_phone: '',
      qm_extension: phoneLogin,
      dial_method: 'INBOUND_MAN',
      closer_choice: ' colain -',
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
    user,
    pass,
    phoneLogin,
    campaign,
    sessionName,
    agendLogId,
  ) {
    const payload = new URLSearchParams();
    payload.append('server_ip', vicidialConfig.privateIP);
    payload.append('session_name', sessionName);
    payload.append('ACTION', 'VDADready');
    payload.append('user', user);
    payload.append('pass', pass);
    payload.append('stage', 'CLOSER');
    payload.append('agent_log_id', agendLogId);
    payload.append('agent_log', '');
    payload.append('wrapup', '');
    payload.append('campaign', campaign);
    payload.append('dial_method', 'INBOUND_MAN');
    payload.append('comments', '');
    payload.append('qm_extension', phoneLogin);

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
    user,
    pass,
    phoneLogin,
    campaign,
    sessionName,
    agendLogId,
  ) {
    const payload = new URLSearchParams();
    payload.append('server_ip', vicidialConfig.privateIP);
    payload.append('session_name', sessionName);
    payload.append('ACTION', 'VDADpause');
    payload.append('user', user);
    payload.append('pass', pass);
    payload.append('stage', 'PAUSED');
    payload.append('agent_log_id', agendLogId);
    payload.append('agent_log', '');
    payload.append('wrapup', '');
    payload.append('campaign', campaign);
    payload.append('dial_method', 'INBOUND_MAN');
    payload.append('comments', '');
    payload.append('qm_extension', phoneLogin);

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
    user,
    pass,
    phoneLogin,
    campaign,
    sessionName,
    agendLogId,
    confExten,
  ) {
    const payload = new URLSearchParams();
    payload.append('server_ip', vicidialConfig.privateIP);
    payload.append('session_name', sessionName);
    payload.append('ACTION', 'userLOGout');
    payload.append('format', 'text');
    payload.append('user', user);
    payload.append('pass', pass);
    payload.append('campaign', campaign);
    payload.append('conf_exten', confExten);
    payload.append('extension', phoneLogin);
    payload.append('protocol', 'SIP');
    payload.append('agent_log_id', agendLogId);
    payload.append('no_delete_sessions', '1');
    payload.append('enable_sipsak_messages', '0');
    payload.append('LogouTKicKAlL', '1');
    payload.append('ext_context', 'default');
    payload.append('qm_extension', phoneLogin);
    payload.append('stage', 'NORMAL');
    payload.append('pause_trigger', '');
    payload.append('dial_method', 'INBOUND_MAN');
    payload.append('pause_max_url_trigger', '');

    try {
      const res = await axios.post(this.vdcDbQueryApi, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('res.data', res.data);

      return res.data;
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Error:', error.response?.data || error.message);
    }
  }

  async pauseAgent(agentUser: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('version', '2.14');
    queryParams.append('source', 'test');
    queryParams.append('user', this.user);
    queryParams.append('pass', this.pass);
    queryParams.append('agent_user', agentUser);
    queryParams.append('function', 'external_pause');
    queryParams.append('value', 'PAUSE');

    const response = await axios.get(
      `${this.urlAgentApi}?${queryParams.toString()}`,
    );

    const data = response.data;

    const parts = data.trim().split('|');

    if (parts.length <= 1 || parts[0].startsWith('ERROR')) {
      // Manejo de error o respuesta inesperada
      throw new Error('No se pudo pausar el agente.');
    }

    return { data };
  }

  async pauseCodeAgent(agentUser: string, code: VicidialPauseCode) {
    const queryParams = new URLSearchParams();
    queryParams.append('version', '2.14');
    queryParams.append('source', 'test');
    queryParams.append('user', this.user);
    queryParams.append('pass', this.pass);
    queryParams.append('agent_user', agentUser);
    queryParams.append('function', 'pause_code');
    queryParams.append('value', code);

    const url = this.urlAgentApi;

    try {
      const res = await axios.post(url, queryParams.toString(), {
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
    const queryParams = new URLSearchParams();
    queryParams.append('version', '2.14');
    queryParams.append('source', 'test');
    queryParams.append('user', this.user);
    queryParams.append('pass', this.pass);
    queryParams.append('agent_user', agentUser);
    queryParams.append('function', 'external_pause');
    queryParams.append('value', 'RESUME');

    const response = await axios.get(
      `${this.urlAgentApi}?${queryParams.toString()}`,
    );

    const data = response.data;

    const parts = data.trim().split('|');

    if (parts.length <= 1 || parts[0].startsWith('ERROR')) {
      // Manejo de error o respuesta inesperada
      throw new Error('No se pudo despausar el agente.');
    }

    return { data };
  }

  async agentStatus(
    user: string,
    pass: string,
    campaign: string,
    sessionName: string,
    confExten: string,
  ) {
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
      const parsed: any = rawResponse
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
            } else {
              if (part.includes('~')) {
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
              }
            }
            return acc;
          },
          {} as Record<string, any>,
        );

      return {
        status: parsed.Status,
        pauseCode: parsed.APIPaUseCodE,
        channel: parsed.channel,
        agentChannel: parsed.agentChannel,
      };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async transferCall(
    user: string,
    pass: string,
    campaign: string,
    sessionName: string,
    exten: string,
    sessionId: string,
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
      campaign: campaign,
      exten: exten,
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
      session_id: sessionId,
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

      console.log('resTransfer', res);

      const data = res.data;

      return { data };
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error(error.response?.data || error.message);
    }
  }

  async endCall(
    user: string,
    pass: string,
    campaign: string,
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
      campaign: campaign,
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
      protocol: 'SIP',
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
    campaign: string,
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
      campaign: campaign,
      group_id: 'colain',
    });

    console.log("payload", payload)

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
    campaign: string,
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
      campaign: campaign,
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

  private buildQueryCID(user: string, prefix: string, sufix?: string) {
    const random = sufix ?? Math.random().toString(36).substring(2, 6); // 4 chars aleatorios
    const epoch = Math.floor(Date.now() / 1000);
    return `${prefix}${random}${epoch}${user.repeat(4)}`;
  }
}
