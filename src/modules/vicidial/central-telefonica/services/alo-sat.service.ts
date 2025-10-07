import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { format, parse } from 'date-fns';
import { VicidialAgentStatus } from '@common/enums/status-call.enum';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { VicidialApiService } from '@modules/vicidial/vicidial-api/vicidial-api.service';
import { AmiService } from '@modules/vicidial/ami/ami.service';

interface TransactionExtended extends Transaction {
  finished?: 'commit' | 'rollback';
}

interface UserAgent {
  agentUser: string;
  userPass: string;
  phoneLogin: string;
  phonePass: string;
}

@Injectable()
export class AloSatService {
  constructor(
    @InjectConnection('central') private readonly db: Sequelize,
    private readonly vicidialUserRepository: VicidialUserRepository,
    private readonly vicidialApiService: VicidialApiService,
    @Inject(forwardRef(() => AmiService))
    private readonly amiService: AmiService,
  ) {}

  async getAgent(userId: number): Promise<UserAgent> {
    const userVici = await this.vicidialUserRepository.findOne({
      where: {
        userId,
      },
    });
    if (!userVici) {
      throw new NotFoundException(
        'El agente no tiene configuración de VICIdial',
      );
    }

    const agent = userVici.toJSON();

    return {
      agentUser: agent.username,
      userPass: agent.userPass,
      phoneLogin: agent.phoneLogin,
      phonePass: agent.phonePass,
    };
  }

  getOriginateCid(confExten: string) {
    const now = new Date();
    const formattedDate = now.toISOString().slice(2, 19).replace(/[-T:]/g, '');
    return `S${formattedDate}${confExten}`;
  }

  async findAllCampaigns(userId: number): Promise<VicidialCampaign[]> {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser } = await this.getAgent(userId);

    try {
      const results = await this.db.query(
        `
          SELECT 
              UPPER(vc.campaign_id) AS campaign_id,
              vc.campaign_name
          FROM vicidial_campaigns vc
          JOIN vicidial_users vu 
              ON vu.user = ?
          JOIN vicidial_user_groups vug 
              ON vu.user_group = vug.user_group
          WHERE 
              vug.allowed_campaigns LIKE '%-ALL-CAMPAIGNS-%'
              OR vc.campaign_id IN (
                  SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(vug.allowed_campaigns, ' ', numbers.n), ' ', -1) AS campaign_id
                  FROM (
                      SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
                      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
                  ) numbers
                  WHERE numbers.n <= 1 + LENGTH(vug.allowed_campaigns) - LENGTH(REPLACE(vug.allowed_campaigns, ' ', ''))
              );
        `,
        {
          replacements: [agentUser],
          type: QueryTypes.SELECT,
        },
      );

      return results
        .map((item) => item as VicidialCampaign)
        .filter((item: VicidialCampaign) => item.campaign_id != '');
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el progreso');
    }
  }

  async agentLogin(userId: number, campaign: string): Promise<any> {
    // 1. Obtener credenciales del agente
    const { agentUser, userPass, phoneLogin, phonePass } =
      await this.getAgent(userId);

    // 2. Intentar login en Vicidial
    const resLogin = await this.vicidialApiService.agentLogin(
      agentUser,
      userPass,
      phoneLogin,
      phonePass,
      campaign,
    );

    if (!resLogin) {
      throw new Error(`No se pudo iniciar sesión para el agente ${agentUser}.`);
    }

    const codeRes = await this.vicidialApiService.pauseCodeAgent(
      agentUser,
      VicidialPauseCode.LOGIN,
    );

    // 3. Obtener datos de sesión en una consulta rápida
    const [liveAgent]: any = await this.db.query(
      `
      SELECT vla.user, vla.server_ip, vsd.session_name
      FROM vicidial_live_agents vla
      JOIN vicidial_session_data vsd
        ON vla.conf_exten = vsd.conf_exten
      WHERE vla.user = ?
      ORDER BY vsd.login_time DESC
      LIMIT 1;
    `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    if (!liveAgent?.server_ip || !liveAgent?.session_name) {
      throw new Error(
        `No se encontró sesión activa para el agente ${agentUser}.`,
      );
    }

    // 4. Configurar grupos de cierre (ingroups)
    await this.vicidialApiService.changeIngroups(
      agentUser,
      userPass,
      phoneLogin,
      campaign,
      liveAgent.server_ip,
      liveAgent.session_name,
    );

    return { success: true, agentUser, campaign };
  }

  async agentLogout(userId: number) {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser, userPass, phoneLogin } = await this.getAgent(userId);

    const transaction: TransactionExtended = await this.db.transaction();

    try {
      const [agentData]: any = await this.db.query(
        `
        SELECT 
            vla.user,
            vla.server_ip,
            vla.campaign_id,
            vsd.session_name,
            val.agent_log_id
        FROM vicidial_live_agents vla
        JOIN vicidial_session_data vsd
            ON vla.conf_exten = vsd.conf_exten
        LEFT JOIN vicidial_agent_log val
            ON val.user = vla.user
        WHERE vla.user = ?
        ORDER BY val.event_time DESC, vsd.login_time DESC
        LIMIT 1;
      `,
        {
          replacements: [agentUser],
          type: QueryTypes.SELECT,
        },
      );

      console.log('agentData', agentData);

      const response = await this.vicidialApiService.setAgentLogout(
        agentUser,
        userPass,
        phoneLogin,
        agentData?.campaign_id,
        agentData?.server_ip,
        agentData?.session_name,
        1166,
        /* agentData?.agent_log_id, */
      );

      console.log('response', response);

      return response;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new InternalServerErrorException(error.message);
    }
  }

  async setAgentStatus(
    agentUser: string,
    serverIP: string,
    status: VicidialAgentStatus,
  ) {
    await this.db.query(
      `
        UPDATE vicidial_live_agents vla
        SET 
          vla.status= ?,
          vla.last_state_change=NOW()
        WHERE vla.user = ?
          AND vla.server_ip = ?
        `,
      {
        replacements: [status, agentUser, serverIP],
      },
    );
  }

  async pauseAgent(
    userId: number,
    pauseCode: VicidialPauseCode | '',
  ): Promise<any> {
    const { agentUser, userPass, phoneLogin } = await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vla.user,
            vla.server_ip,
            vla.campaign_id,
            vsd.session_name,
            val.agent_log_id
        FROM vicidial_live_agents vla
        JOIN vicidial_session_data vsd
            ON vla.conf_exten = vsd.conf_exten
        LEFT JOIN vicidial_agent_log val
            ON val.user = vla.user
        WHERE vla.user = ?
        ORDER BY val.event_time DESC, vsd.login_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    /* Pausar el agente */
    const pauseRes = await this.vicidialApiService.setAgentPause(
      agentUser,
      userPass,
      phoneLogin,
      agentData?.campaign_id,
      agentData?.server_ip,
      agentData?.session_name,
      agentData?.agent_log_id,
    );

    console.log('pauseRes', pauseRes);

    if (pauseCode != '') {
      /* Agregar un codigo de pausa */
      const codeRes = await this.vicidialApiService.pauseCodeAgent(
        agentUser,
        pauseCode,
      );

      console.log('codeRes', codeRes);
    }

    return {
      message: `Agente ${agentUser} pausado con código ${pauseCode}`,
    };
  }

  async resumeAgent(userId: number): Promise<any> {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser, userPass, phoneLogin, phonePass } =
      await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vla.user,
            vla.server_ip,
            vla.campaign_id,
            vsd.session_name,
            val.agent_log_id
        FROM vicidial_live_agents vla
        JOIN vicidial_session_data vsd
            ON vla.conf_exten = vsd.conf_exten
        LEFT JOIN vicidial_agent_log val
            ON val.user = vla.user
        WHERE vla.user = ?
        ORDER BY val.event_time DESC, vsd.login_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const response = await this.vicidialApiService.setAgentReady(
      agentUser,
      userPass,
      phoneLogin,
      agentData?.campaign_id,
      agentData?.server_ip,
      agentData?.session_name,
      agentData?.agent_log_id,
    );

    return response;
  }

  async agentStatus(userId: number): Promise<any> {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser, userPass } = await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vla.user,
            vla.server_ip,
            vla.campaign_id,
            vla.last_state_change,
            vla.calls_today,
            vsd.session_name,
            vla.conf_exten
        FROM vicidial_live_agents vla
        JOIN vicidial_session_data vsd
            ON vla.conf_exten = vsd.conf_exten
        WHERE vla.user = ?
        ORDER BY vsd.login_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    if (!agentData) {
      return {
        agentUser,
        status: 'LOGGED_OUT',
      };
    }

    const res: any = await this.vicidialApiService.agentStatus(
      agentUser,
      userPass,
      agentData.campaign_id,
      agentData.server_ip,
      agentData.session_name,
      agentData.conf_exten,
    );

    if (res?.status == 'QUEUE') {
      await this.setAgentStatus(
        agentUser,
        agentData.server_ip,
        VicidialAgentStatus.INCALL,
      );
    }

    let callInfo: any;

    if (res?.status == 'INCALL') {
      const { call_info } = await this.checkIncomingCall(
        agentUser,
        agentData.server_ip,
        agentData.campaign_id,
        agentData.calls_today,
      );
      callInfo = call_info;
    }

    return {
      agentUser,
      ...res,
      callInfo,
      lastChange: agentData.last_state_change,
      callsToday: agentData.calls_today,
    };
  }

  async endCall(userId: number): Promise<any> {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser, userPass } = await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vla.server_ip,
            vsd.session_name,
            vla.uniqueid,
            vla.lead_id,
            vl.list_id,
            vla.campaign_id,
            vl.phone_number,
            vl.phone_code,
            vla.extension,
            vla.conf_exten,
            vla.agent_log_id,
            vac.callerid,
            vl.called_count
        FROM vicidial_live_agents vla
        LEFT JOIN vicidial_session_data vsd 
              ON vsd.user = vla.user
        LEFT JOIN vicidial_users vu 
              ON vu.user = vla.user
        LEFT JOIN vicidial_list vl 
              ON vl.lead_id = vla.lead_id
        LEFT JOIN vicidial_auto_calls vac 
              ON vac.lead_id = vla.lead_id
        LEFT JOIN call_log cl
              ON cl.uniqueid = vla.uniqueid
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const resStatus: any = await this.vicidialApiService.agentStatus(
      agentUser,
      userPass,
      agentData.campaign_id,
      agentData.server_ip,
      agentData.session_name,
      agentData.conf_exten,
    );

    console.log('resStatus', resStatus);

    const res: any = await this.vicidialApiService.endCall(
      agentUser,
      userPass,
      agentData.campaign_id,
      agentData.server_ip,
      agentData.session_name,
      agentData.uniqueid,
      agentData.lead_id,
      agentData.list_id,
      agentData.phone_number,
      agentData.phone_code,
      resStatus.channel,
      agentData.conf_exten,
      agentData.agent_log_id,
      agentData.callerid,
      resStatus.agentChannel,
    );
    console.log('res', res);

    if (res) {
      await this.pauseAgent(userId, VicidialPauseCode.WRAP);
    }
  }

  async checkIncomingCall(
    agentUser: string,
    serverIP: string,
    campaign: string,
    currentCallsToday: number,
  ) {
    const transaction = await this.db.transaction();
    try {
      // 1. Verificar si hay llamada en cola o ya en curso (QUEUE o INCALL)
      const [callData]: any = await this.db.query(
        `
      SELECT lead_id, uniqueid, callerid, channel, call_server_ip, comments, status, TIMESTAMPDIFF(SECOND, last_call_time, NOW()) AS call_seconds
      FROM vicidial_live_agents
      WHERE server_ip = ?
        AND user = ?
        AND campaign_id = ?
        AND status IN ('QUEUE', 'INCALL')
      LIMIT 1
      `,
        {
          replacements: [serverIP, agentUser, campaign],
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      if (!callData) {
        await transaction.commit();
        return {
          success: true,
          incoming_call: false,
          message: 'No calls in queue or active',
          response: '0',
        };
      }

      let { lead_id, uniqueid, callerid, channel, call_server_ip, status } =
        callData;
      if (!call_server_ip || call_server_ip.length < 7) {
        call_server_ip = serverIP;
      }

      let newCallsToday = currentCallsToday;

      // 2. Si está en QUEUE → actualizar a INCALL y calls_today
      if (status === 'QUEUE') {
        newCallsToday = (currentCallsToday || 0) + 1;

        await this.db.query(
          `
        UPDATE vicidial_live_agents vla
        JOIN vicidial_campaign_agents vca
          ON vla.user = vca.user AND vla.campaign_id = vca.campaign_id
        SET 
          vla.status='INCALL',
          vla.last_call_time=NOW(),
          vla.calls_today = :callsToday,
          vla.external_hangup=0,
          vla.external_status='',
          vla.external_pause='',
          vla.external_dial='',
          vla.last_state_change=NOW(),
          vla.pause_code='',
          vla.preview_lead_id='0',
          vca.calls_today = :callsToday
        WHERE vla.user = :user
          AND vla.server_ip = :serverIp
        `,
          {
            replacements: {
              callsToday: newCallsToday,
              user: agentUser,
              serverIp: serverIP,
            },
            transaction,
          },
        );
      }

      // 3. Obtener datos del lead
      const [leadData]: any = await this.db.query(
        `
      SELECT lead_id, entry_date, modify_date, status, user,
             vendor_lead_code, source_id, list_id, gmt_offset_now,
             called_since_last_reset, phone_code, phone_number, title,
             first_name, middle_initial, last_name, address1, address2, address3,
             city, state, province, postal_code, country_code, gender, date_of_birth,
             alt_phone, email, security_phrase, comments, called_count,
             last_local_call_time, rank, owner, entry_list_id
      FROM vicidial_list
      WHERE lead_id = ?
      LIMIT 1
      `,
        {
          replacements: [lead_id],
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      if (!leadData) {
        await transaction.rollback();
        return {
          success: false,
          incoming_call: false,
          message: 'Lead not found',
        };
      }

      // Convertir fechas a string
      Object.keys(leadData).forEach((key) => {
        if (leadData[key] instanceof Date) {
          leadData[key] = format(leadData[key], 'yyyy-MM-dd HH:mm:ss');
        }
      });

      const call_basic_info = `${lead_id}|${uniqueid}|${callerid}|${channel}|${call_server_ip}|`;

      await transaction.commit();

      return {
        success: true,
        incoming_call: true,
        message: `Call assigned to ${agentUser}`,
        call_info: {
          lead_id,
          uniqueid,
          callerid,
          phone_number: leadData.phone_number,
          channel,
          call_server_ip,
          lead_data: leadData,
          call_basic_info,
          calls_today: newCallsToday,
          call_seconds: callData.call_seconds, // ⏱ segundos en la llamada
          entryDate: parse(
            leadData.entry_date,
            'yyyy-MM-dd HH:mm:ss',
            new Date(),
          ),
        },
        response: '1',
      };
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      return {
        success: false,
        incoming_call: false,
        message: `Error: ${error.message}`,
      };
    }
  }

  async transferCall(userId: number, userIdTransfer: number): Promise<any> {
    const { agentUser, userPass, phoneLogin } = await this.getAgent(userId);

    const transferUser = await this.getAgent(userIdTransfer);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vla.server_ip,
            vsd.session_name,
            vla.uniqueid,
            vla.lead_id,
            vl.list_id,
            vla.campaign_id,
            vl.phone_number,
            vl.phone_code,
            vla.extension,
            vla.conf_exten,
            vla.agent_log_id,
            vac.callerid,
            vl.called_count
        FROM vicidial_live_agents vla
        LEFT JOIN vicidial_session_data vsd 
              ON vsd.user = vla.user
        LEFT JOIN vicidial_users vu 
              ON vu.user = vla.user
        LEFT JOIN vicidial_list vl 
              ON vl.lead_id = vla.lead_id
        LEFT JOIN vicidial_auto_calls vac 
              ON vac.lead_id = vla.lead_id
        LEFT JOIN call_log cl
              ON cl.uniqueid = vla.uniqueid
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const [agentDataTransfer]: any = await this.db.query(
      `
        SELECT 
            vla.server_ip,
            vla.conf_exten
        FROM vicidial_live_agents vla
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [transferUser.agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const resStatus: any = await this.vicidialApiService.agentStatus(
      agentUser,
      userPass,
      agentData.campaign_id,
      agentData.server_ip,
      agentData.session_name,
      agentData.conf_exten,
    );

    await this.amiService.transferCall(
      resStatus.channel,
      agentDataTransfer.conf_exten,
    );

    await this.setAgentStatus(
      transferUser.agentUser,
      agentData.server_ip,
      VicidialAgentStatus.QUEUE,
    );

    const pauseRes = await this.vicidialApiService.setAgentPause(
      agentUser,
      userPass,
      phoneLogin,
      agentData?.campaign_id,
      agentData?.server_ip,
      agentData?.session_name,
      agentData?.agent_log_id,
    );

    console.log('pauseRes', pauseRes);

    if (pauseRes) {
      await this.pauseAgent(userId, VicidialPauseCode.WRAP);
    }
  }
}
