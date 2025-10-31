import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { col, fn, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { User } from '@modules/user/entities/user.entity';
import { VicidialUserHistoryRepository } from '@modules/user/repositories/vicidial-user-history.repository';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { VicidialUser } from '@modules/user/entities/vicidial-user.entity';
import { Op } from 'sequelize';

@Injectable()
export class MonitorVicidialService {
  constructor(
    @InjectConnection('central') private readonly db: Sequelize,
    private readonly userVicidialRepository: VicidialUserRepository,
    private readonly vicidialUserHistoryRepository: VicidialUserHistoryRepository,
  ) {}
  async vicidialReport() {
    const agentsQuery = `
      SELECT
        COUNT(*) AS agentes_logueados,
        SUM(CASE WHEN vla.status = 'READY' THEN 1 ELSE 0 END) AS agentes_disponibles,
        SUM(CASE WHEN vla.status = 'INCALL' THEN 1 ELSE 0 END) AS agentes_en_atencion,
        SUM(CASE WHEN vla.status = 'PAUSED' THEN 1 ELSE 0 END) AS agentes_pausados
      FROM vicidial_live_agents vla;
    `;
    const callsQuery = `
      SELECT
        COUNT(*) AS llamadas_activas,
        SUM(CASE WHEN vac.campaign_id IS NOT NULL AND vac.status='LIVE' AND vac.agent_only='' THEN 1 ELSE 0 END) AS llamadas_en_cola,
        SUM(CASE WHEN vac.status = 'IVR' THEN 1 ELSE 0 END) AS llamadas_en_ivr
      FROM vicidial_auto_calls vac;
      `;
    const [agents] = await this.db.query<any>(agentsQuery, {
      type: QueryTypes.SELECT,
    });
    const [calls] = await this.db.query<any>(callsQuery, {
      type: QueryTypes.SELECT,
    });
    return {
      ...agents,
      ...calls,
    };
  }
  async vicidialCount(agent: string) {
    const query = `
    SELECT COUNT(*) AS total
    FROM vicidial_agent_log
    WHERE user = :agent
  `;
    const [result] = await this.db.query<{ total: number }>(query, {
      type: QueryTypes.SELECT,
      replacements: { agent },
    });
    return result;
  }

  async vicidialTable() {
    const users = await this.userVicidialRepository.findAll({
      attributes: ['userId', 'phoneLogin'],
      include: [
        {
          model: User,
          as: 'user',
          where: { roleId: 3 },
          attributes: [],
        },
      ],
    });

    const advisorJson: any[] = users.map((a) => a.toJSON());

    const phoneLogins = advisorJson
      .map((a) => a.phoneLogin)
      .filter((p): p is string => !!p);

    if (phoneLogins.length <= 0) {
      return [];
    }

    const query = `
    SELECT 
      vu.phone_login AS phonelogin,
      (
        SELECT CASE
          WHEN al2.talk_sec > 0 THEN 'INCALL'
          WHEN al2.pause_sec > 0 THEN 'PAUSED'
          WHEN al2.wait_sec > 0 THEN 'WAITING'
          WHEN al2.dispo_sec > 0 THEN 'DISPO'
          ELSE 'UNKNOWN'
        END
        FROM vicidial_agent_log al2
        WHERE al2.user = vu.user
        ORDER BY al2.event_time DESC
        LIMIT 1
      ) AS ultimo_estado,
      TIMEDIFF(NOW(), al_last.event_time) AS tiempo_en_estado,
      SEC_TO_TIME(SUM(val.talk_sec)) AS tiempo_total_llamadas,
      SUM(CASE WHEN val.talk_sec > 0 THEN 1 ELSE 0 END) AS llamadas_atendidas,
      SEC_TO_TIME(AVG(NULLIF(val.talk_sec,0))) AS promedio_atencion,
      CONCAT(ROUND(
        (SUM(CASE WHEN val.talk_sec > 0 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(val.agent_log_id),0)) * 100, 2
      ), '%') AS efectividad
    FROM vicidial_users vu
    LEFT JOIN vicidial_agent_log val ON vu.user = val.user
    LEFT JOIN (
      SELECT t.user, t.event_time, t.talk_sec, t.pause_sec, t.wait_sec, t.dispo_sec
      FROM vicidial_agent_log t
      INNER JOIN (
        SELECT user, MAX(event_time) AS max_event
        FROM vicidial_agent_log
        GROUP BY user
      ) ult ON t.user = ult.user AND t.event_time = ult.max_event
    ) al_last ON vu.user = al_last.user
    WHERE vu.phone_login IN (:phoneLogins)
    GROUP BY vu.user, vu.phone_login, al_last.event_time;
  `;

    const phoneLoginMap = new Map(
      advisorJson.map((user) => [user.phoneLogin, user.userId]),
    );

    const table = await this.db.query<any>(query, {
      type: QueryTypes.SELECT,
      replacements: { phoneLogins },
    });

    const finalResults = table.map((result) => ({
      ...result,
      userId: phoneLoginMap.get(result.phonelogin),
    }));

    return finalResults;
  }

  // async vicidialTable() {
  //   // Obtener todos los usuarios con rol 3 que tienen phoneLogin
  //   const users = await this.userVicidialRepository.findAll({
  //     attributes: ['userId', 'phoneLogin'],
  //     include: [
  //       {
  //         model: User,
  //         as: 'user',
  //         where: { roleId: 3 },
  //         attributes: ['displayName'],
  //       },
  //     ],
  //   });

  //   const advisorJson: any[] = users.map((a) => a.toJSON());

  //   if (advisorJson.length === 0) {
  //     return [];
  //   }

  //   const phoneLogins = advisorJson
  //     .map((a) => a.phoneLogin)
  //     .filter((p): p is string => !!p);

  //   if (phoneLogins.length === 0) {
  //     // Si no hay phoneLogins, devolver asesores con data vacía
  //     return advisorJson.map((advisor) => ({
  //       userId: advisor.userId,
  //       name: advisor.user?.displayName,
  //       phonelogin: advisor.phoneLogin,
  //       ultimo_estado: null,
  //       tiempo_en_estado: null,
  //       tiempo_total_llamadas: '00:00:00',
  //       llamadas_atendidas: 0,
  //       promedio_atencion: '00:00:00',
  //       efectividad: '0.00%',
  //     }));
  //   }

  //   const query = `
  //     SELECT
  //       vu.phone_login AS phonelogin,
  //       (
  //         SELECT CASE
  //           WHEN al2.talk_sec > 0 THEN 'INCALL'
  //           WHEN al2.pause_sec > 0 THEN 'PAUSED'
  //           WHEN al2.wait_sec > 0 THEN 'WAITING'
  //           WHEN al2.dispo_sec > 0 THEN 'DISPO'
  //           ELSE 'UNKNOWN'
  //         END
  //         FROM vicidial_agent_log al2
  //         WHERE al2.user = vu.user
  //         ORDER BY al2.event_time DESC
  //         LIMIT 1
  //       ) AS ultimo_estado,
  //       TIMEDIFF(NOW(), al_last.event_time) AS tiempo_en_estado,
  //       IFNULL(SEC_TO_TIME(SUM(val.talk_sec)), '00:00:00') AS tiempo_total_llamadas,
  //       IFNULL(SUM(CASE WHEN val.talk_sec > 0 THEN 1 ELSE 0 END), 0) AS llamadas_atendidas,
  //       IFNULL(SEC_TO_TIME(AVG(NULLIF(val.talk_sec, 0))), '00:00:00') AS promedio_atencion,
  //       CONCAT(
  //         IFNULL(
  //           ROUND(
  //             (SUM(CASE WHEN val.talk_sec > 0 THEN 1 ELSE 0 END) /
  //              NULLIF(COUNT(val.agent_log_id), 0)) * 100, 2
  //           ), 0
  //         ), '%'
  //       ) AS efectividad
  //     FROM vicidial_users vu
  //     LEFT JOIN vicidial_agent_log val ON vu.user = val.user
  //       AND DATE(val.event_time) = CURDATE()
  //     LEFT JOIN (
  //       SELECT t.user, t.event_time, t.talk_sec, t.pause_sec, t.wait_sec, t.dispo_sec
  //       FROM vicidial_agent_log t
  //       INNER JOIN (
  //         SELECT user, MAX(event_time) AS max_event
  //         FROM vicidial_agent_log
  //         GROUP BY user
  //       ) ult ON t.user = ult.user AND t.event_time = ult.max_event
  //     ) al_last ON vu.user = al_last.user
  //     WHERE vu.phone_login IN (:phoneLogins)
  //     GROUP BY vu.user, vu.phone_login, al_last.event_time;
  //   `;

  //   const phoneLoginMap = new Map(
  //     advisorJson.map((user) => [user.phoneLogin, user]),
  //   );

  //   const table = await this.db.query<any>(query, {
  //     type: QueryTypes.SELECT,
  //     replacements: { phoneLogins },
  //   });

  //   // Crear un Set de phoneLogins que tienen data
  //   const phoneLoginsWithData = new Set(table.map((r) => r.phonelogin));

  //   // Mapear resultados existentes
  //   const resultsWithData = table.map((result) => {
  //     const advisor = phoneLoginMap.get(result.phonelogin);
  //     return {
  //       userId: advisor?.userId,
  //       name: advisor?.user?.displayName,
  //       phonelogin: result.phonelogin,
  //       ultimo_estado: result.ultimo_estado,
  //       tiempo_en_estado: result.tiempo_en_estado,
  //       tiempo_total_llamadas: result.tiempo_total_llamadas,
  //       llamadas_atendidas: result.llamadas_atendidas,
  //       promedio_atencion: result.promedio_atencion,
  //       efectividad: result.efectividad,
  //     };
  //   });

  //   // Agregar asesores sin data
  //   const advisorsWithoutData = advisorJson
  //     .filter((advisor) => !phoneLoginsWithData.has(advisor.phoneLogin))
  //     .map((advisor) => ({
  //       userId: advisor.userId,
  //       name: advisor.user?.displayName,
  //       phonelogin: advisor.phoneLogin,
  //       ultimo_estado: null,
  //       tiempo_en_estado: null,
  //       tiempo_total_llamadas: '00:00:00',
  //       llamadas_atendidas: 0,
  //       promedio_atencion: '00:00:00',
  //       efectividad: '0.00%',
  //     }));

  //   // Combinar ambos arrays
  //   const finalResults = [...resultsWithData, ...advisorsWithoutData];

  //   return finalResults;
  // }

  formatDateToMySQL(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  async getStateDetailsByAdvisor(userId: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const result = await this.vicidialUserHistoryRepository.findAll({
        where: {
          startTime: {
            [Op.between]: [today, tomorrow],
          },
        },
        attributes: [
          'newChannelStateId',
          [fn('SUM', col('duration')), 'duration'],
        ],
        include: [
          {
            model: VicidialUser,
            required: true,
            where: { userId }, // 🔹 filtra por el user_id de vicidial_users
            attributes: ['id', 'username'],
          },
          {
            model: ChannelState,
            as: 'newChannelState',
            required: true,
            attributes: ['id', 'name'], // 🔹 asegúrate de que 'name' existe en ChannelState
          },
        ],
        group: [
          'VicidialUserHistory.new_channel_state_id',
          'newChannelState.id',
          'vicidialUser.id', // 🔹 también necesario si incluyes VicidialUser
        ],
        order: [['newChannelStateId', 'ASC']],
      });

      return {
        states: result.map((item) => item.toJSON()),
        total: result.reduce(
          (acc, item) => acc + parseInt(item.toJSON().duration ?? '0'),
          0,
        ),
      };
    } catch (error) {
      console.error(error);
    }
  }

  async getCallsCount() {
    const query = `
      SELECT
        -- Llamadas atendidas (usa event_time en lugar de call_date)
        (SELECT COUNT(*) 
        FROM vicidial_agent_log 
        WHERE talk_sec > 0
        AND DATE(event_time) = CURDATE()
        ) AS llamadas_atendidas,

        -- Total de llamadas (puedes limitar por fecha si lo deseas)
        (SELECT COUNT(*) 
        FROM vicidial_closer_log
        ) AS llamadas_totales,

        -- Llamadas perdidas (DROP / ABANDON)
        (SELECT COUNT(*) 
        FROM vicidial_closer_log 
        WHERE status IN ('DROP', 'ABANDON')
        AND DATE(call_date) = CURDATE()
        ) AS llamadas_perdidas,

        -- Llamadas en cola (usa last_update_time)
        (SELECT COUNT(*) 
        FROM vicidial_auto_calls 
        WHERE status = 'LIVE'
        AND DATE(last_update_time) = CURDATE()
        ) AS llamadas_en_cola;
    `;

    const result = await this.db.query(query, {
      type: QueryTypes.SELECT,
    });

    return result[0];
  }
}
