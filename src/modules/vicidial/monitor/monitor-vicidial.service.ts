import { VicidialAgentStatus } from '@common/enums/status-call.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { AloSatService } from '../central-telefonica/services/alo-sat.service';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class MonitorVicidialService {
  constructor(@InjectConnection('central') private readonly db: Sequelize,
 private readonly userVicidialRepository: VicidialUserRepository,) {}
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
    const query = `SELECT COUNT(*) as total
       FROM vicidial_agent_log    WHERE  user = '${agent}'`;
    const result = await this.db.query<{ total: number }>(query, {
      type: QueryTypes.SELECT,
    });

    return result[0];
  }
  async vicidialTable() {
  
    const users = await this.userVicidialRepository.findAll({
      attributes:['userId','phoneLogin'],
      include: [{
        attributes:[],
        model: User, as: 'user',
        where: { roleId: 3 }
      }]
    })
    const advisorJson: any[] = users.map((a) => a.toJSON());
    const phoneLogins = advisorJson
      .map((a) => a.phoneLogin)
      .filter((p): p is string => !!p);
    if (phoneLogins.length <= 0) {
      return [];
    }
    const query = `SELECT 
    vu.phone_login as phonelogin,
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
LEFT JOIN vicidial_agent_log val 
ON vu.user = val.user
LEFT JOIN (
    SELECT t.user, t.event_time, t.talk_sec, t.pause_sec, t.wait_sec, t.dispo_sec
    FROM vicidial_agent_log t
    INNER JOIN (
        SELECT user, MAX(event_time) AS max_event
        FROM vicidial_agent_log
        GROUP BY user
    ) ult ON t.user = ult.user AND t.event_time = ult.max_event
) al_last ON vu.user = al_last.user
Where vu.phone_login IN (:phoneLogins)
GROUP BY vu.user, vu.full_name, al_last.event_time, al_last.talk_sec, al_last.pause_sec, al_last.wait_sec, al_last.dispo_sec; `;
    const phoneLoginMap = new Map(
      advisorJson.map(user => [user.phoneLogin, user.userId])
    );
    const table = await this.db.query<any>(query, { type: QueryTypes.SELECT, replacements: { phoneLogins } });
    const finalResults = table.map(result => ({
      ...result,
      userId: phoneLoginMap.get(result.phonelogin)
    }));
    return finalResults;
  }
  formatDateToMySQL(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}
  async getStateDetailsByAdvisor(agentId: number, start: Date, finish?: Date) {
    const begin = new Date(start);
    const user = await this.userVicidialRepository.findOne({where:{userId:agentId}})
    if(!user) throw new NotFoundException('no se encontro la cuenta vicidial del usuario')
    const username = user.toJSON().username
    begin.setHours(0, 0, 0, 0);
    const end = finish ? new Date(finish) : new Date();
    end.setHours(0, 0, 0, 0);
    const beginStr = this.formatDateToMySQL(begin);
  const endStr = this.formatDateToMySQL(end);
    const query = `
    SELECT 
        user,
        DATE(event_time) AS fecha,
        SEC_TO_TIME(SUM(pause_sec)) AS tiempo_pausa,
        SEC_TO_TIME(SUM(wait_sec)) AS tiempo_espera,
        SEC_TO_TIME(SUM(talk_sec)) AS tiempo_llamadas,
        SEC_TO_TIME(SUM(dispo_sec)) AS tiempo_dispo,
        SEC_TO_TIME(SUM(dead_sec)) AS tiempo_unknown,
        SEC_TO_TIME(SUM(
          pause_sec + wait_sec + talk_sec + dispo_sec + dead_sec
        )) AS tiempo_total
    FROM vicidial_agent_log
    WHERE user = '${username}'
    AND event_time BETWEEN '${beginStr}' AND '${endStr}'
    GROUP BY user, DATE(event_time)
    ORDER BY fecha ASC;
  `;
    const result = await this.db.query<any>(query, {
      replacements: { username },
      type: QueryTypes.SELECT,
    });
    return result;
  }
  async getCallsCount() {
    const query = `
    SELECT
      (SELECT COUNT(*) 
       FROM vicidial_agent_log 
       WHERE  talk_sec > 0
       AND DATE(call_date) = CURDATE()
       ) AS llamadas_atendidas,

      (SELECT COUNT(*) 
       FROM vicidial_closer_log 
       ) AS llamadas_totales,

      (SELECT COUNT(*) 
       FROM vicidial_closer_log 
       WHERE  status IN ('DROP','ABANDON')
       AND DATE(call_date) = CURDATE()
       ) AS llamadas_perdidas,

      (SELECT COUNT(*) 
       FROM vicidial_auto_calls 
       WHERE status = 'LIVE'
       AND DATE(call_date) = CURDATE()
       ) AS llamadas_en_cola
  `;

    const result = await this.db.query(query, {
      type: QueryTypes.SELECT,
    });

    return result[0];
  }
}
