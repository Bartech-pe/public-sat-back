import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { format, parse } from 'date-fns';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { VicidialApiService } from '@modules/vicidial/vicidial-api/vicidial-api.service';
import { vicidialConfig } from 'config/env';
import { CallHistoryRepository } from '@modules/call/repositories/call-history.repository';
import { CallHistory } from '@modules/call/entities/call-history.entity';
import { stripPeruCode } from '@common/helpers/phone.helper';
import { VicidialUser } from '@modules/user/entities/vicidial-user.entity';

interface TransactionExtended extends Transaction {
  finished?: 'commit' | 'rollback';
}

interface UserAgent {
  agentUser: string;
  userPass: string;
  phoneLogin: string;
  phonePass: string;
  campaignId: string;
  inboundGroups: string;
  sessionName: string;
  confExten: string;
}

@Injectable()
export class AloSatService {
  constructor(
    @InjectConnection('central') private readonly db: Sequelize,
    private readonly vicidialUserRepository: VicidialUserRepository,
    private readonly vicidialApiService: VicidialApiService,
    private readonly callHistoryRepository: CallHistoryRepository,
  ) {}

  async getAgentNameByConfExten(
    confExten: string,
  ): Promise<string | undefined> {
    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vla.user,
            SUBSTRING_INDEX(
                SUBSTRING_INDEX(vsd.agent_login_call, '<', -1),
                '>',
                1
            ) AS calleridnum
        FROM vicidial_live_agents vla
        JOIN vicidial_session_data vsd
            ON vla.conf_exten = vsd.conf_exten
        LEFT JOIN vicidial_agent_log val
            ON val.user = vla.user
        WHERE vla.conf_exten = ?
        ORDER BY val.event_time DESC, vsd.login_time DESC
        LIMIT 1;
      `,
      {
        replacements: [confExten],
        type: QueryTypes.SELECT,
      },
    );

    return agentData?.user;
  }

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

    const agent: VicidialUser = userVici.toJSON();

    return {
      agentUser: agent.username,
      userPass: agent.userPass,
      phoneLogin: agent.phoneLogin,
      phonePass: agent.phonePass,
      campaignId: agent.campaignId!,
      inboundGroups: agent.inboundGroups!,
      sessionName: agent.sessionName!,
      confExten: agent.confExten!,
    };
  }

  getOriginateCid(confExten: string) {
    const now = new Date();
    const formattedDate = now.toISOString().slice(2, 19).replace(/[-T:]/g, '');
    return `S${formattedDate}${confExten}`;
  }

  async findUserGroups(): Promise<{ userGroup: string; groupName: string }[]> {
    const response: any[] = await this.db.query(
      `
      SELECT user_group, group_name FROM vicidial_user_groups;;
    `,
      {
        replacements: [],
        type: QueryTypes.SELECT,
      },
    );
    return response.map((item) => ({
      userGroup: item.user_group,
      groupName: item.group_name,
    }));
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
              vc.active = 'Y'
              AND vc.dial_method = 'INBOUND_MAN'
              AND vug.allowed_campaigns LIKE '%-ALL-CAMPAIGNS-%'
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
      console.log('error', error);
      throw new InternalServerErrorException('Error al obtener el progreso');
    }
  }

  async findInboundGroupsByCampaign(
    campaignId: string,
  ): Promise<{ groupId: string; groupName: string }[]> {
    const response: any[] = await this.db.query(
      `
      SELECT 
          c.campaign_id,
          c.campaign_name,
          TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(c.closer_campaigns, ' ', n.n), ' ', -1)) AS group_id,
          g.group_name,
          g.active
      FROM vicidial_campaigns c
      JOIN (
          SELECT a.N + b.N * 10 + 1 AS n
          FROM 
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
              UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
              UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b
      ) n
      ON n.n <= 1 + (LENGTH(c.closer_campaigns) - LENGTH(REPLACE(c.closer_campaigns, ' ', '')))
      LEFT JOIN vicidial_inbound_groups g 
        ON g.group_id = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(c.closer_campaigns, ' ', n.n), ' ', -1))
      WHERE c.closer_campaigns NOT IN ('', '-', ' ')
        AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(c.closer_campaigns, ' ', n.n), ' ', -1)) NOT IN ('', '-', '--ALL--')
        AND g.active = 'Y'
        AND c.campaign_id = ?
      ORDER BY c.campaign_id, g.group_id;


    `,
      {
        replacements: [campaignId],
        type: QueryTypes.SELECT,
      },
    );
    return response.map((item) => ({
      groupId: item.group_id,
      groupName: item.group_name,
    }));
  }

  async findAllCallDisposition(
    campaignId: string,
  ): Promise<{ statusId: string; statusName: string; campaignId: string }[]> {
    const defaultStates: any[] = await this.db.query(
      `
      SELECT cs.status, cs.status_name FROM vicidial_statuses AS cs 
      WHERE cs.selectable = 'Y' 
      ORDER BY cs.status ASC;
    `,
      {
        replacements: [campaignId],
        type: QueryTypes.SELECT,
      },
    );

    const campaignStates: any[] = campaignId
      ? await this.db.query(
          `
      SELECT cs.status, cs.status_name, cs.campaign_id FROM vicidial_campaign_statuses AS cs 
      WHERE cs.selectable = 'Y' AND cs.campaign_id = ? 
      ORDER BY cs.status ASC;
    `,
          {
            replacements: [campaignId],
            type: QueryTypes.SELECT,
          },
        )
      : await this.db.query(
          `
      SELECT cs.status, cs.status_name, cs.campaign_id FROM vicidial_campaign_statuses AS cs 
      WHERE cs.selectable = 'Y' 
      ORDER BY cs.status ASC;
    `,
          {
            replacements: [],
            type: QueryTypes.SELECT,
          },
        );
    return [...defaultStates, ...campaignStates].map((item) => ({
      statusId: item.status,
      statusName: item.status_name,
      campaignId: item.campaign_id ?? undefined,
    }));
  }

  async findAllCampaignPauseCode(
    campaignId?: string,
  ): Promise<{ pauseCode: string; pauseCodeName: string }[]> {
    const response: any[] = campaignId
      ? await this.db.query(
          `
      SELECT ps.pause_code, ps.pause_code_name FROM vicidial_pause_codes AS ps 
      WHERE ps.campaign_id = ? 
      ORDER BY ps.pause_code ASC;
    `,
          {
            replacements: [campaignId],
            type: QueryTypes.SELECT,
          },
        )
      : await this.db.query(
          `
      SELECT ps.pause_code, ps.pause_code_name FROM vicidial_pause_codes AS ps 
      ORDER BY ps.pause_code ASC;
    `,
          {
            replacements: [],
            type: QueryTypes.SELECT,
          },
        );
    return response.map((item) => ({
      pauseCode: item.pause_code,
      pauseCodeName: item.pause_code_name,
    }));
  }

  async findCampaignDials(
    campaignId: string,
  ): Promise<
    | { d1?: string; d2?: string; d3?: string; d4?: string; d5?: string }
    | undefined
  > {
    const [response]: {
      d1?: string;
      d2?: string;
      d3?: string;
      d4?: string;
      d5?: string;
    }[] = await this.db.query(
      `
      SELECT 
      c.xferconf_a_number as d1, 
      c.xferconf_b_number as d2, 
      c.xferconf_c_number as d3, 
      c.xferconf_d_number as d4, 
      c.xferconf_e_number as d5
      FROM vicidial_campaigns c
      WHERE c.campaign_id = ? ;
    `,
      {
        replacements: [campaignId],
        type: QueryTypes.SELECT,
      },
    );

    return response;
  }

  async agentLogin(
    userId: number,
    campaign: string,
  ): Promise<{
    success: boolean;
    agentUser: string;
    campaign: string;
    sessionName: string;
    confExten: string;
  }> {
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

    // 3. Obtener datos de sesión en una consulta rápida
    const [liveAgent]: any = await this.db.query(
      `
      SELECT vla.user, vla.server_ip, vsd.session_name, vla.conf_exten
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

    return {
      success: true,
      agentUser,
      campaign,
      sessionName: liveAgent.session_name,
      confExten: liveAgent.conf_exten,
    };
  }

  async agentRelogin(userId: number): Promise<any> {
    // 1. Obtener credenciales del agente
    const { agentUser, userPass, phoneLogin, phonePass } =
      await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vsd.session_name,
            vla.campaign_id,
            vla.extension,
            vla.conf_exten,
            p.protocol,
            ca.campaign_cid
        FROM vicidial_live_agents vla
        LEFT JOIN vicidial_session_data vsd 
            ON vsd.user = vla.user
        LEFT JOIN vicidial_campaigns ca
            ON ca.campaign_id = vla.campaign_id
        LEFT JOIN phones p
            ON vsd.extension = p.extension
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const resStatus: any = await this.vicidialApiService.agentRelogin(
      agentUser,
      userPass,
      agentData.campaign_id,
      agentData.session_name,
      agentData.conf_exten,
      phoneLogin,
      agentData.extension,
      agentData.campaign_cid,
      agentData.protocol,
    );

    await this.onChangeIngroups(userId);

    return { success: true, agentUser };
  }

  async onChangeIngroups(userId) {
    // 1. Obtener credenciales del agente
    const {
      agentUser,
      userPass,
      phoneLogin,
      campaignId,
      sessionName,
      inboundGroups,
    } = await this.getAgent(userId);

    // 2. Configurar grupos de cierre (ingroups)
    await this.vicidialApiService.changeIngroups(
      agentUser,
      userPass,
      phoneLogin,
      campaignId,
      sessionName,
      inboundGroups,
    );
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
            vla.campaign_id,
            vsd.session_name,
            val.agent_log_id,
            p.protocol,
            vla.conf_exten
        FROM vicidial_live_agents vla
        JOIN vicidial_session_data vsd
            ON vla.conf_exten = vsd.conf_exten
        LEFT JOIN vicidial_agent_log val
            ON val.user = vla.user
        LEFT JOIN phones p
            ON vsd.extension = p.extension
        WHERE vla.user = ?
        ORDER BY val.event_time DESC, vsd.login_time DESC
        LIMIT 1;
      `,
        {
          replacements: [agentUser],
          type: QueryTypes.SELECT,
        },
      );

      if (agentData) {
        const response = await this.vicidialApiService.setAgentLogout(
          agentUser,
          userPass,
          phoneLogin,
          agentData?.campaign_id,
          agentData?.session_name,
          agentData?.agent_log_id,
          agentData?.conf_exten,
          agentData?.protocol,
        );

        return true;
      }
      return true;
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw new InternalServerErrorException(error.message);
    }
  }

  async pauseAgent(userId: number, pauseCode?: string): Promise<any> {
    const { agentUser, userPass, phoneLogin } = await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vla.user,
            vla.campaign_id,
            vsd.session_name,
            val.agent_log_id,
            p.protocol,
            p.phone_ip
        FROM vicidial_live_agents vla
        JOIN vicidial_session_data vsd
            ON vla.conf_exten = vsd.conf_exten
        LEFT JOIN vicidial_agent_log val
            ON val.user = vla.user
        LEFT JOIN phones p
            ON vsd.extension = p.extension
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
      agentData?.session_name,
      agentData?.agent_log_id,
    );

    const codeRes = await this.vicidialApiService.pauseCodeAgent(
      pauseCode,
      agentUser,
      userPass,
      phoneLogin,
      agentData?.campaign_id,
      agentData?.session_name,
      agentData?.agent_log_id,
      agentData?.phone_ip,
      agentData?.protocol,
    );

    return {
      message: `Agente ${agentUser} pausado con código ${pauseCode}`,
    };
  }

  async resumeAgent(userId: number): Promise<any> {
    // 1️⃣ Obtenemos las credenciales del agente
    const { agentUser, userPass, phoneLogin, phonePass, inboundGroups } =
      await this.getAgent(userId);

    // 2️⃣ Consultamos sesión activa
    const [agentData]: any = await this.db.query(
      `
      SELECT 
          vla.user,
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

    if (!agentData?.session_name) {
      console.error('No se encontró sesión activa para el agente:', agentUser);
      return;
    }

    const response = await this.vicidialApiService.setAgentReady(
      agentUser,
      userPass,
      phoneLogin,
      agentData?.campaign_id,
      agentData?.session_name,
      agentData?.agent_log_id,
    );
    return response;
  }

  async checkVdc(userId: number): Promise<
    | {
        status?: string;
        pauseCode?: string;
        channel?: string;
        agentChannel?: string;
      }
    | undefined
  > {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const {
      agentUser,
      userPass,
      phoneLogin,
      campaignId,
      sessionName,
      confExten,
    } = await this.getAgent(userId);

    const res = await this.vicidialApiService.checkVdc(
      agentUser,
      userPass,
      campaignId,
      sessionName,
      confExten,
    );

    if (res?.status) {
      const [agentData]: any = await this.db.query(
        `
          SELECT 
              vla.user,
              vla.campaign_id,
              vla.pause_code,
              vsd.session_name,
              val.agent_log_id,
              p.phone_ip,
              CASE
                  WHEN vla.status = 'PAUSED' 
                      AND vla.lead_id <> 0 THEN 'DISPO'
                  WHEN vla.status = 'INCALL' THEN 'INCALL'
                  WHEN vla.status = 'READY' THEN 'READY'
                  WHEN vla.status = 'PAUSED' THEN 'PAUSED'
                  ELSE vla.status
              END AS status
          FROM vicidial_live_agents vla
          JOIN vicidial_session_data vsd
              ON vla.conf_exten = vsd.conf_exten
          LEFT JOIN phones p
              ON vsd.extension = p.extension
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

      res.status = agentData.status!;

      res.pauseCode = agentData.pause_code ? agentData.pause_code : undefined;

      if (['CLOSER', 'QUEUE'].includes(res.status!)) {
        await this.vicidialApiService.checkINCOMING(
          agentUser,
          userPass,
          phoneLogin,
          campaignId,
          sessionName,
          agentData?.agent_log_id,
          confExten,
          res.status!,
        );
      }
    }

    return res;
  }

  async getCallInfo(userId: number) {
    const { agentUser, userPass, campaignId } = await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT
            vla.user,
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

    const { callInfo } = await this.checkIncomingCall(
      agentUser,
      campaignId,
      agentData.calls_today,
    );

    return callInfo;
  }

  async endCall(userId: number): Promise<any> {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser, userPass, phoneLogin, inboundGroups } =
      await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vsd.session_name,
            vcl.uniqueid,
            vla.lead_id,
            vl.list_id,
            vla.campaign_id,
            vl.phone_number,
            vl.phone_code,
            vla.extension,
            vla.conf_exten,
            vla.agent_log_id,
            vac.callerid,
            p.protocol,
            cl.extension AS nextCID,
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
        LEFT JOIN vicidial_closer_log vcl 
              ON vcl.lead_id = vla.lead_id
        LEFT JOIN call_log cl 
              ON cl.uniqueid = vcl.uniqueid
        LEFT JOIN phones p
              ON vsd.extension = p.extension
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const resStatus: any = await this.vicidialApiService.checkVdc(
      agentUser,
      userPass,
      agentData.campaign_id,
      agentData.session_name,
      agentData.conf_exten,
    );

    await this.vicidialApiService.hangupCall(
      agentUser,
      userPass,
      phoneLogin,
      agentData.campaign_id,
      agentData.session_name,
      resStatus.channel,
      agentData.conf_exten,
      inboundGroups.replace(' -', '').trim(),
      agentData.nextCID,
    );

    const res: any = await this.vicidialApiService.endCall(
      agentUser,
      userPass,
      agentData.campaign_id,
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
      agentData.protocol,
    );

    // if (res) {
    //   // await this.pauseAgent(userId, VicidialPauseCode.WRAP);
    //   // await this.onChangeIngroups(userId);
    // }
  }

  async checkIncomingCall(
    agentUser: string,
    campaign: string,
    calls_today: number = 0,
  ) {
    const transaction = await this.db.transaction();
    try {
      // 1. Verificar si hay llamada en cola o ya en curso (QUEUE o INCALL)
      const [callData]: any = await this.db.query(
        `
        SELECT 
          lead_id, 
          uniqueid, 
          callerid, 
          channel, 
          call_server_ip, 
          comments, 
          status, 
          TIMESTAMPDIFF(SECOND, last_call_time, NOW()) AS call_seconds
        FROM vicidial_live_agents
        WHERE server_ip = ?
          AND user = ?
          AND campaign_id = ?
        LIMIT 1;
      `,
        {
          replacements: [vicidialConfig.privateIP, agentUser, campaign],
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

      call_server_ip = vicidialConfig.privateIP;

      // 2. Obtener datos del lead
      const [leadData]: any = await this.db.query(
        `
        SELECT vl.lead_id, vl.entry_date, vl.modify_date, vl.vendor_lead_code, vcl.length_in_sec,
					vl.source_id, vl.list_id, vl.gmt_offset_now, vl.called_since_last_reset, 
					vl.phone_code, vl.phone_number, vl.called_count, vl.last_local_call_time, entry_list_id
        FROM vicidial_list vl
        INNER JOIN vicidial_closer_log vcl
        	ON vcl.lead_id = vl.lead_id
        WHERE (vl.lead_id = :lead_id OR (:lead_id = 0 AND vl.user = :user))
        ORDER BY CASE WHEN :lead_id = 0 THEN vl.lead_id END DESC
        LIMIT 1;
        `,
        {
          replacements: {
            lead_id: lead_id || 0,
            user: agentUser, // el mismo que usas para buscar en vicidial_live_agents
          },
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

      const call_basic_info = `${leadData.lead_id}|${uniqueid}|${callerid}|${channel}|${call_server_ip}|`;

      await transaction.commit();

      const entryDate = parse(
        leadData.entry_date,
        'yyyy-MM-dd HH:mm:ss',
        new Date(),
      );

      const updatedAt = new Date(entryDate);
      updatedAt.setSeconds(
        entryDate.getSeconds() + (leadData.length_in_sec ?? 0),
      );

      return {
        success: true,
        incoming_call: true,
        message: `Call assigned to ${agentUser}`,
        callInfo: {
          leadId: lead_id,
          uniqueId: uniqueid,
          callerId: callerid,
          phoneNumber: stripPeruCode(leadData.phone_number),
          channel,
          callServerIp: call_server_ip,
          userCode: leadData.user,
          callStatus: leadData.status,
          callBasicInfo: call_basic_info,
          callsToday: calls_today,
          callSeconds: leadData.length_in_sec, // ⏱ segundos en la llamada
          entryDate: entryDate,
          updatedAt: updatedAt,
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
    const { agentUser, userPass, phoneLogin, campaignId } =
      await this.getAgent(userId);

    const transferUser = await this.getAgent(userIdTransfer);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vsd.session_name,
            vla.channel,
            vcl.uniqueid,
            vla.lead_id,
            vl.list_id,
            vl.phone_number,
            vl.phone_code,
            vla.extension,
            vla.conf_exten,
            vla.agent_log_id,
            vac.callerid,
            p.protocol,
            vl.called_count,
            TIMESTAMPDIFF(SECOND, vac.call_time, NOW()) AS secondS
        FROM vicidial_live_agents vla
        LEFT JOIN vicidial_session_data vsd 
              ON vsd.user = vla.user
        LEFT JOIN vicidial_users vu 
              ON vu.user = vla.user
        LEFT JOIN vicidial_list vl 
              ON vl.lead_id = vla.lead_id
        LEFT JOIN vicidial_auto_calls vac 
              ON vac.lead_id = vla.lead_id
        LEFT JOIN vicidial_closer_log vcl 
              ON vcl.lead_id = vla.lead_id
        LEFT JOIN phones p
              ON vsd.extension = p.extension
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const resStatus: any = await this.vicidialApiService.transferCall(
      agentUser,
      userPass,
      campaignId,
      agentData.session_name,
      transferUser.phoneLogin,
      agentData.conf_exten,
      agentData.uniqueid,
      agentData.lead_id,
      agentData.channel,
      agentData.callerid,
      agentData.secondS,
    );

    const pauseRes = await this.vicidialApiService.setAgentPause(
      agentUser,
      userPass,
      phoneLogin,
      agentData?.campaign_id,
      agentData?.session_name,
      agentData?.agent_log_id,
    );

    if (pauseRes) {
      await this.pauseAgent(userId, VicidialPauseCode.WRAP);
    }
  }

  async parkCall(userId: number, putOn: boolean): Promise<any> {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser, userPass } = await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vsd.session_name,
            vcl.uniqueid,
            vla.lead_id,
            vla.channel,
            vl.list_id,
            vla.campaign_id,
            vla.extension,
            vla.conf_exten,
            vla.agent_log_id,
            vac.callerid,
            p.protocol,
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
        LEFT JOIN vicidial_closer_log vcl 
              ON vcl.lead_id = vla.lead_id
        LEFT JOIN phones p
              ON vsd.extension = p.extension
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const res: any = await this.vicidialApiService.sendParkAction(
      putOn,
      agentUser,
      userPass,
      agentData.campaign_id,
      agentData.session_name,
      agentData.conf_exten,
      agentData.uniqueid,
      agentData.lead_id,
      agentData.extension,
      agentData.channel,
      agentData.callerid,
    );
  }

  async transferSurvey(userId: number, deal: string): Promise<any> {
    /* Obtenemos las credenciales del agente a partir del id del usuario */
    const { agentUser, userPass, campaignId } = await this.getAgent(userId);

    const deals = await this.findCampaignDials(campaignId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vsd.session_name,
            vcl.uniqueid,
            vla.lead_id,
            vla.channel,
            vl.list_id,
            vl.vendor_lead_code,
            vla.extension,
            vla.conf_exten,
            vla.agent_log_id,
            vac.callerid,
            p.protocol,
            SUBSTRING_INDEX(
					SUBSTRING_INDEX(vsd.agent_login_call, '<', -1),
					'>',
					1
            ) AS calleridnum
        FROM vicidial_live_agents vla
        LEFT JOIN vicidial_session_data vsd 
              ON vsd.user = vla.user
        LEFT JOIN vicidial_users vu 
              ON vu.user = vla.user
        LEFT JOIN vicidial_list vl 
              ON vl.lead_id = vla.lead_id
        LEFT JOIN vicidial_auto_calls vac 
              ON vac.lead_id = vla.lead_id
        LEFT JOIN vicidial_closer_log vcl 
              ON vcl.lead_id = vla.lead_id
        LEFT JOIN phones p
              ON vsd.extension = p.extension
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const res: any = await this.vicidialApiService.transferSurvey(
      deal.toUpperCase(),
      agentUser,
      userPass,
      campaignId,
      agentData.session_name,
      agentData.conf_exten,
      agentData.lead_id,
      `Local/${deals?.[deal]}@default`,
      agentData.vendor_lead_code,
      agentData.calleridnum,
    );
  }

  async getFinalStatusByLeadId(leadId: string): Promise<string | undefined> {
    const [result]: any = await this.db.query(
      `
    SELECT status
    FROM (
      SELECT status, call_date FROM vicidial_log WHERE lead_id = ?
      UNION ALL
      SELECT status, call_date FROM vicidial_closer_log WHERE lead_id = ?
    ) tmp
    ORDER BY call_date DESC
    LIMIT 1;
    `,
      { replacements: [leadId, leadId], type: QueryTypes.SELECT },
    );
    return result?.status;
  }

  async updateDispo(
    userId: number,
    dispoChoice: string,
    pauseAgent: boolean,
  ): Promise<any> {
    const { agentUser, userPass, phoneLogin, campaignId, inboundGroups } =
      await this.getAgent(userId);

    const [agentData]: any = await this.db.query(
      `
        SELECT 
            vsd.session_name,
            vla.channel,
            vcl.uniqueid,
            vla.lead_id,
            vl.list_id,
            vl.phone_number,
            vl.phone_code,
            vla.extension,
            vla.conf_exten,
            vla.agent_log_id,
            vac.callerid,
            p.protocol,
            vl.called_count,
            cl.extension AS nextCID,
            TIMESTAMPDIFF(SECOND, vac.call_time, NOW()) AS secondS
        FROM vicidial_live_agents vla
        LEFT JOIN vicidial_session_data vsd 
                ON vsd.user = vla.user
        LEFT JOIN vicidial_users vu 
                ON vu.user = vla.user
        LEFT JOIN vicidial_list vl 
                ON vl.lead_id = vla.lead_id
        LEFT JOIN vicidial_auto_calls vac 
                ON vac.lead_id = vla.lead_id
        LEFT JOIN vicidial_closer_log vcl 
                ON vcl.lead_id = vla.lead_id
        LEFT JOIN call_log cl 
                ON cl.uniqueid = vcl.uniqueid
        LEFT JOIN phones p
                ON vsd.extension = p.extension
        WHERE vla.user = ?
        ORDER BY vla.last_update_time DESC
        LIMIT 1;
      `,
      {
        replacements: [agentUser],
        type: QueryTypes.SELECT,
      },
    );

    const resStatus: any = await this.vicidialApiService.updateDispo(
      agentUser,
      userPass,
      campaignId,
      agentData.session_name,
      phoneLogin,
      agentData.conf_exten,
      agentData.uniqueid,
      agentData.lead_id,
      agentData.agent_log_id,
      agentData.list_id,
      agentData.phone_number,
      dispoChoice,
      inboundGroups.replace(' -', '').trim(),
      agentData.nextCID,
    );

    if (!pauseAgent) {
      await this.resumeAgent(userId);
    }
  }
}
