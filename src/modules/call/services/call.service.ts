import { CallStateRepository } from '../repositories/call-state.repository';
import {
  Injectable,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { CallRepository } from '../repositories/call.repository';
import { CallFilter } from '../dto/call-filter.dto';
import { User } from '@modules/user/entities/user.entity';
import { col, fn, literal, Op, QueryTypes } from 'sequelize';
import {
  DataCollection,
  GetPages,
  PaginatedResponse,
} from '@common/interfaces/paginated-response.interface';
import { Sequelize } from 'sequelize-typescript';
import {
  AdvisorItem,
  AdvisorItemInfo,
  CallItemNew,
  CallItemRow,
  CallStateItem,
  StateCountItems,
  StateCountQuery,
} from '../dto/call-collection.dto';
import { InjectConnection } from '@nestjs/sequelize';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { AdvisorDTO } from '../../vicidial/ami/dto/ami.dto';
import { CallHistoryRepository } from '../repositories/call-history.repository';
import { CallHistory } from '../entities/call-history.entity';

const callstates = {
  XFER: 'Transferidas',
  DROP: 'Abandonadas',
  SALE: 'Concluidas',
  QUEUE: 'En cola',
  // OTHER: 'Otros',
};

function getPages(limit: number, total: number): number {
  return Math.ceil(total / (limit || 1));
}

@Injectable()
export class CallService {
  constructor(
    private readonly repository: CallRepository,
    private readonly stateRepository: CallStateRepository,
    private readonly vicidialUserRepository: VicidialUserRepository,
    @InjectConnection('central') private readonly centralConnection: Sequelize,
    private readonly callHistoryRepository: CallHistoryRepository,
  ) {}

  async getCallHistory(
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<CallHistory & { callSateName: string }>> {
    const res = await this.callHistoryRepository.findAndCountAll({
      include: [{ model: User, as: 'user', required: false }],
      order: [['entryDate', 'DESC']],
      limit,
      offset,
    });
    return {
      ...res,
      data: res.data
        .map((d) => d.toJSON())
        .map(
          (d: CallHistory) =>
            ({
              ...d,
              callSateName: callstates[d.callStatus] ?? 'Abandonado',
            }) as CallHistory & { callSateName: string },
        ),
    };
  }

  async getCallsFromVicidial(
    limit?: number,
    offset?: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<CallItemNew>> {
    const userIds = q?.userIds;

    const search = q?.search;

    const startDate = q?.startDate;

    const endDate = q?.endDate;

    const stateId = q?.stateId;

    const vUsers = (
      await this.vicidialUserRepository.findAll({
        attributes: ['username'],
        include: [{ model: User, as: 'user' }],
        where: userIds
          ? {
              userId: {
                [Op.in]: userIds,
              },
            }
          : {},
      })
    ).map((u) => u.toJSON());

    const usernames = vUsers.map((u) => `'${u.username}'`).join(',');

    let whereOption = [`vl.length_in_sec > 0 AND u.user IN (${usernames})`];

    if (search) {
      whereOption.push(`vl.phone_number like '%${search}%'`);
    }

    if (stateId) {
      whereOption.push(`vl.status = '${stateId}'`);
    }

    if (startDate && endDate) {
      whereOption.push(`vl.call_date BETWEEN '${startDate}' AND '${endDate}'`);
    }

    const mainSql = `SELECT 
      lead_id,
      call_type,
      call_date,
      user,
      phone_number,
      status,
      status_name,
      length_in_sec,
      campaign_id,
      recording_id,
      filename,
      recording_location
    FROM (
        -- Llamadas salientes
        SELECT 
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            CASE 
            WHEN vl.status = 'DISPO' THEN 'Disposition Screen'
            ELSE COALESCE(vcs.status_name, vs.status_name) 
          END AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_log vl
        LEFT JOIN vicidial_users u ON vl.user = u.user
        LEFT JOIN vicidial_agent_log val
            ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl 
            ON rl.lead_id = vl.lead_id
      LEFT JOIN vicidial_statuses vs 
            ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs 
            ON vl.status = vcs.status 
          AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        -- Llamadas entrantes
        SELECT 
          vl.lead_id,
          'INBOUND' AS call_type,
          vl.call_date,
          vl.user,
          vl.phone_number,
          vl.status,
          CASE 
            WHEN vl.status = 'DISPO' THEN 'Disposition Screen'
            ELSE COALESCE(vcs.status_name, vs.status_name) 
          END AS status_name,
          vl.length_in_sec,
          val.campaign_id,
          rl.recording_id,
          rl.filename,
          rl.location AS recording_location
        FROM vicidial_closer_log vl
        LEFT JOIN vicidial_users u 
            ON vl.user = u.user
        LEFT JOIN vicidial_agent_log val
            ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl 
            ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs 
            ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs 
            ON vl.status = vcs.status 
          AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}
    ) AS llamadas`;

    const sql = `
      ${mainSql}
      ORDER BY lead_id DESC
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    const totalSQL = `
      SELECT COUNT(*) AS total
      FROM (${mainSql}) as calls
    `;

    const [totalResult] = await this.centralConnection.query<{ total: number }>(
      totalSQL,
      { replacements: [], type: QueryTypes.SELECT },
    );

    const results = await this.centralConnection.query<CallItemRow>(sql, {
      replacements: [],
      type: QueryTypes.SELECT,
    });

    const collection: PaginatedResponse<CallItemNew> = {
      data: results.map((r) => ({
        callDate: new Date(r.call_date),
        filename: r.filename,
        leadId: r.lead_id,
        lengthInSec: r.length_in_sec,
        phoneNumber: r.phone_number,
        recordingLocation: r.recording_location,
        recordingId: r.recording_id,
        user: vUsers.find((u) => u.username == r.user)?.user,
        status: r.status,
        statusName: r.status_name,
      })),
      total: totalResult.total,
      offset,
      limit,
    };

    return collection;

    // const where: string[] = [];
    // const replacements: any[] = [];

    // // === Filtros dinámicos ===
    // if (q?.startDate && q?.endDate) {
    //   where.push(
    //     `(COALESCE(rl.start_time, vl.last_local_call_time) BETWEEN ? AND ?)`,
    //   );
    //   replacements.push(q?.startDate, q?.endDate);
    // }

    // // if (filter.search && filter.search.trim() !== '') {
    // //   where.push(
    // //     `(vu.full_name LIKE ? OR vl.phone_number LIKE ? OR vu.full_name IS NULL)`,
    // //   );
    // //   replacements.push(`%${filter.search}%`, `%${filter.search}%`);
    // // }

    // if (q?.advisor && q?.advisor !== '') {
    //   where.push(`(vu.user LIKE ? OR vu.user IS NULL)`);
    //   replacements.push(`%${q?.advisor}%`);
    // }

    // // === Estado ===
    // if (q?.stateId && q?.stateId > 0) {
    //   if (q?.stateId === 1) {
    //     where.push(`
    //       (vcl.status IN ('01','02','03','04','05','06','1','2','3','4','5','6','SALE','A','CALLBK','INTERESTED','CONTACT','INFO','DISPO'))
    //     `);
    //   } else if (q?.stateId === 2) {
    //     where.push(`
    //       (vcl.status IN ('07','08','09','10','11','12','13','7','8','9','DROP','HANGUP','BUSY','NA','N','MAXCAL','ABANDON'))
    //     `);
    //   } else if (q?.stateId === 3) {
    //     where.push(`
    //       (vcl.status IN ('14','15','16','17','QUEUE','TIMEOT','XFER','INCALL','CBHOLD'))
    //     `);
    //   }
    // }

    // // === Filtros de validez (agente + fecha + duración) ===
    // where.push(`
    //   (vu.user IS NOT NULL)
    //   AND (COALESCE(rl.start_time, vl.last_local_call_time) IS NOT NULL)
    //   AND (COALESCE(rl.length_in_sec, 0) > 0)
    // `);

    // // ===================================
    // // === CTEs para logs y estado =======
    // // ===================================
    // const cte = `
    //   WITH vcl AS (
    //     SELECT lead_id, status, user FROM vicidial_closer_log
    //     UNION ALL
    //     SELECT lead_id, status, user FROM vicidial_closer_log_archive
    //   ),
    //   vlogs AS (
    //     SELECT lead_id, user FROM vicidial_log
    //     UNION ALL
    //     SELECT lead_id, user FROM vicidial_log_archive
    //   )
    // `;

    // // ===================================
    // // === TOTAL DE REGISTROS ============
    // // ===================================
    // const totalSQL = `
    //   ${cte}
    //   SELECT COUNT(*) AS total
    //   FROM vicidial_list vl
    //   LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
    //   LEFT JOIN vcl ON vcl.lead_id = vl.lead_id
    //   LEFT JOIN vlogs ON vlogs.lead_id = vl.lead_id
    //   LEFT JOIN vicidial_users vu
    //     ON vu.user = COALESCE(rl.user, vcl.user, vlogs.user)
    //   ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''};
    // `;

    // console.log("totalSQL", totalSQL)

    // const totalResult = await this.centralConnection.query<{ total: number }>(
    //   totalSQL,
    //   { replacements, type: QueryTypes.SELECT },
    // );
    // const total = totalResult[0]?.total ?? 0;

    // // ===================================
    // // === CONSULTA PRINCIPAL ============
    // // ===================================
    // const sql = `
    //   ${cte}
    //   SELECT
    //     rl.recording_id,
    //     vu.full_name,
    //     vu.user,
    //     vl.lead_id,
    //     rl.filename,
    //     rl.location,
    //     rl.start_time,
    //     rl.length_in_sec,
    //     vl.phone_number,
    //     vl.list_id,
    //     CASE
    //       WHEN vcl.status IN ('SALE','A','CALLBK','INTERESTED','CONTACT','INFO','DISPO','01','02','03','04','05','06','1','2','3','4','5','6') THEN 'Concluido'
    //       WHEN vcl.status IN ('DROP','HANGUP','BUSY','NA','N','MAXCAL','ABANDON','07','08','09','10','11','12','13','7','8','9') THEN 'Abandonado'
    //       WHEN vcl.status IN ('QUEUE','TIMEOT','XFER','INCALL','CBHOLD','14','15','16','17') THEN 'Escalado'
    //       ELSE 'Concluido'
    //     END AS status
    //   FROM vicidial_list vl
    //   LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
    //   LEFT JOIN vcl ON vcl.lead_id = vl.lead_id
    //   LEFT JOIN vlogs ON vlogs.lead_id = vl.lead_id
    //   LEFT JOIN vicidial_users vu
    //     ON vu.user = COALESCE(rl.user, vcl.user, vlogs.user)
    //   ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
    //   ORDER BY rl.start_time DESC
    //   LIMIT ? OFFSET ?;
    // `;

    // replacements.push(limit, offset);

    // const results = await this.centralConnection.query<CallItemRow>(sql, {
    //   replacements,
    //   type: QueryTypes.SELECT,
    // });

    // const collection: DataCollection<CallItemRow> = {
    //   items: results,
    //   total,
    //   page: Math.floor((offset ?? 0) / (limit ?? 50)) + 1,
    //   pages: getPages(limit ?? 50, total),
    // };

    // return collection;
  }

  async getCallsCountersFromVicidial(q?: Record<string, any>) {
    const userIds = q?.userIds;

    const search = q?.search;

    const startDate = q?.startDate;

    const endDate = q?.endDate;

    const stateId = q?.stateId;

    const vUsers = (
      await this.vicidialUserRepository.findAll({
        attributes: ['username'],
        include: [{ model: User, as: 'user' }],
        where: userIds
          ? {
              userId: {
                [Op.in]: userIds,
              },
            }
          : {},
      })
    ).map((u) => u.toJSON());

    const usernames = vUsers.map((u) => `'${u.username}'`).join(',');

    let whereOption = [`vl.length_in_sec > 0 AND u.user IN (${usernames})`];

    if (search) {
      whereOption.push(`vl.phone_number like '%${search}%'`);
    }

    if (stateId) {
      whereOption.push(`vl.status = '${stateId}'`);
    }

    if (startDate && endDate) {
      whereOption.push(`vl.call_date BETWEEN '${startDate}' AND '${endDate}'`);
    }

    const mainSql = `SELECT 
      lead_id,
      call_type,
      call_date,
      user,
      phone_number,
      status,
      status_name,
      length_in_sec,
      campaign_id,
      recording_id,
      filename,
      recording_location,
      CASE
        WHEN status IN ('DROP', 'NA', 'NOANSWER', 'ABANDON', 'TIMEOUT') THEN 'DROP'
        WHEN status IN ('SALE', 'COMPLETE', 'ANSWERED', 'CBHOLD', 'FINISHED') THEN 'SALE'
        WHEN status IN ('QUEUE', 'INQUEUE', 'WAITING') THEN 'QUEUE'
        WHEN status IN ('ESCALATED', 'TRANSFER', 'XFER') THEN 'XFER'
        ELSE 'SALE'
      END AS call_category
    FROM (
        -- Llamadas salientes
        SELECT 
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            CASE 
            WHEN vl.status = 'DISPO' THEN 'Disposition Screen'
            ELSE COALESCE(vcs.status_name, vs.status_name) 
          END AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_log vl
        LEFT JOIN vicidial_users u ON vl.user = u.user
        LEFT JOIN vicidial_agent_log val
            ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl 
            ON rl.lead_id = vl.lead_id
      LEFT JOIN vicidial_statuses vs 
            ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs 
            ON vl.status = vcs.status 
          AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        -- Llamadas entrantes
        SELECT 
          vl.lead_id,
          'INBOUND' AS call_type,
          vl.call_date,
          vl.user,
          vl.phone_number,
          vl.status,
          CASE 
            WHEN vl.status = 'DISPO' THEN 'Disposition Screen'
            ELSE COALESCE(vcs.status_name, vs.status_name) 
          END AS status_name,
          vl.length_in_sec,
          val.campaign_id,
          rl.recording_id,
          rl.filename,
          rl.location AS recording_location
        FROM vicidial_closer_log vl
        LEFT JOIN vicidial_users u 
            ON vl.user = u.user
        LEFT JOIN vicidial_agent_log val
            ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl 
            ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs 
            ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs 
            ON vl.status = vcs.status 
          AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}
    ) AS llamadas`;

    const groupSQL = `
      SELECT calls.call_category as callStatus, COUNT(*) AS total
      FROM (${mainSql}) as calls
      GROUP BY call_category;
    `;

    const resumenRaw = await this.centralConnection.query<{
      callStatus: string;
      total: number;
    }>(groupSQL, { replacements: [], type: QueryTypes.SELECT });

    const ESTADOS = ['QUEUE', 'DROP', 'XFER', 'SALE'];

    // Normalizamos el resultado, garantizando que todos los estados estén presentes
    const resumen = ESTADOS.map((status) => {
      const item = resumenRaw.find((r) => r.callStatus === status);
      return {
        callStatus: status,
        callSateName: callstates[status],
        total: item ? Number(item.total) : 0,
      };
    });
    return resumen;
  }

  async getCallsCounterByNow(username?: string) {
    const startDay = new Date();
    startDay.setHours(0, 0, 0);
    const endDay = new Date();
    endDay.setHours(23, 59, 59);

    // Convertir a formato SQL (YYYY-MM-DD HH:MM:SS)
    const formatDateForSQL = (date) => {
      const localDate = new Date(date.getTime() - 5 * 60 * 60 * 1000);
      return localDate.toISOString().slice(0, 19).replace('T', ' ');
    };

    let usernames = '';

    if (!username) {
      const vUsers = (
        await this.vicidialUserRepository.findAll({
          attributes: ['username'],
          include: [{ model: User, as: 'user' }],
        })
      ).map((u) => u.toJSON());

      usernames = vUsers.map((u) => `'${u.username}'`).join(',');
    } else {
      usernames = `'${username}'`;
    }

    let whereOption = [`u.user IN (${usernames})`];

    if (startDay && endDay) {
      whereOption.push(
        `vl.call_date BETWEEN '${formatDateForSQL(startDay)}' AND '${formatDateForSQL(endDay)}'`,
      );
    }

    const mainSql = `SELECT 
      lead_id,
      call_type,
      call_date,
      user,
      phone_number,
      status,
      status_name,
      length_in_sec,
      campaign_id,
      recording_id,
      filename,
      recording_location,
      CASE
        WHEN status IN ('DROP', 'NA', 'NOANSWER', 'ABANDON', 'TIMEOUT') THEN 'DROP'
        WHEN status IN ('SALE', 'COMPLETE', 'ANSWERED', 'CBHOLD', 'FINISHED') THEN 'SALE'
        WHEN status IN ('QUEUE', 'INQUEUE', 'WAITING') THEN 'QUEUE'
        WHEN status IN ('ESCALATED', 'TRANSFER', 'XFER') THEN 'XFER'
        ELSE 'SALE'
      END AS call_category
    FROM (
        -- Llamadas salientes
        SELECT 
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            CASE 
            WHEN vl.status = 'DISPO' THEN 'Disposition Screen'
            ELSE COALESCE(vcs.status_name, vs.status_name) 
          END AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_log vl
        LEFT JOIN vicidial_users u ON vl.user = u.user
        LEFT JOIN vicidial_agent_log val
            ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl 
            ON rl.lead_id = vl.lead_id
      LEFT JOIN vicidial_statuses vs 
            ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs 
            ON vl.status = vcs.status 
          AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        -- Llamadas entrantes
        SELECT 
          vl.lead_id,
          'INBOUND' AS call_type,
          vl.call_date,
          vl.user,
          vl.phone_number,
          vl.status,
          CASE 
            WHEN vl.status = 'DISPO' THEN 'Disposition Screen'
            ELSE COALESCE(vcs.status_name, vs.status_name) 
          END AS status_name,
          vl.length_in_sec,
          val.campaign_id,
          rl.recording_id,
          rl.filename,
          rl.location AS recording_location
        FROM vicidial_closer_log vl
        LEFT JOIN vicidial_users u 
            ON vl.user = u.user
        LEFT JOIN vicidial_agent_log val
            ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl 
            ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs 
            ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs 
            ON vl.status = vcs.status 
          AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}
    ) AS llamadas`;

    const groupSQL = `
      SELECT calls.call_category as callStatus, SUM(length_in_sec) AS duration, COUNT(*) AS total
      FROM (${mainSql}) as calls
      GROUP BY call_category;
    `;

    console.log('groupSQL', groupSQL);

    const resumenRaw = await this.centralConnection.query<{
      callStatus: string;
      duration: number;
      total: number;
    }>(groupSQL, { replacements: [], type: QueryTypes.SELECT });

    const ESTADOS = ['QUEUE', 'DROP', 'XFER', 'SALE'];

    // Normalizamos el resultado, garantizando que todos los estados estén presentes
    const resumen = ESTADOS.map((status) => {
      const item = resumenRaw.find((r) => r.callStatus === status);
      return {
        callStatus: status,
        callStateName: callstates[status],
        duration: item ? Number(item.duration) : 0,
        total: item ? Number(item.total) : 0,
      };
    });

    return {
      calls: resumen,
      total: resumen.reduce((acc, item) => acc + item.total, 0),
      queueTotal:
        resumen.find((item) => item.callStatus == 'QUEUE')?.total ?? 0,
      saleTotal: resumen.find((item) => item.callStatus == 'SALE')?.total ?? 0,
    };
  }

  async findByCategories() {
    const allStates = await this.stateRepository.findAll({
      attributes: ['id', 'name', 'icon', 'style'],
      where: {
        id: {
          [Op.in]: [1, 2, 3],
        },
      },
    });
    const statesJson = allStates.map((q) => q.toJSON());
    const callCounts = await this.repository.findAll({
      attributes: ['id', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['callStateId'],
      raw: true,
    });
    const countMap = new Map();
    callCounts.forEach((item: any) => {
      countMap.set(item.callStateId, parseInt(item.count ?? 0));
    });
    const rows = await this.repository.findAndCountAll({});
    const formattedStates: CallStateItem[] = statesJson.map((state) => ({
      name: state.name,
      icon: state.icon,
      style: state.style,
      total: countMap.get(state.callStateId) || 0,
    }));
    const result = [
      {
        name: 'Total',
        icon: 'mdi:phone',
        total: rows.total,
        style: 'text-600',
      },
      ...formattedStates,
    ];
    return result;
  }
  async create(
    duration: number,
    phoneNumber: string,
    callStateId: number,
    userId: number,
    recording?: string,
  ) {
    const create = await this.repository.create({
      duration,
      phoneNumber,
      callStateId,
      userId,
      recording,
    });
    return create;
  }
  async getAdvisors() {
    const getAdvisors = await this.vicidialUserRepository.findAll({
      attributes: ['phoneLogin'],
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });
    const advisorJson: any[] = getAdvisors.map((a) => a.toJSON());
    return advisorJson.map((a) => a.user);
    // const phoneLogins = advisorJson
    //   .map((a) => a.phoneLogin)
    //   .filter((p): p is string => !!p);
    // if (phoneLogins.length <= 0) {
    //   return [];
    // }
    // try {
    //   const sql = `
    //   SELECT DISTINCT
    //     vu.user as id,
    //     vu.full_name as displayName
    //   FROM vicidial_users vu
    //   WHERE vu.active = 'Y'
    //   AND vu.user_group NOT IN ('DESARROLLO', 'DEMO')
    //   AND vu.full_name REGEXP '[^0-9]'
    //   AND vu.full_name IS NOT NULL
    //   AND vu.phone_login IN (:phoneLogins)
    //   ORDER BY vu.full_name
    // `;
    //   const results = await this.centralConnection.query<AdvisorItem>(sql, {
    //     type: QueryTypes.SELECT,
    //     replacements: { phoneLogins },
    //   });
    //   return results;
    // } catch (error) {
    //   console.log(error);
    //   return [];
    // }
  }
  async GetAdvisorsInfo() {
    const getAdvisors = await this.vicidialUserRepository.findAll({
      attributes: ['username', 'phoneLogin'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['displayName'],
          where: { roleId: 3 },
        },
      ],
    });
    const Advisors: AdvisorDTO[] = getAdvisors.map((a) => a.toJSON());
    const phoneLogins = Advisors.map((a) => a.phoneLogin).filter(
      (p): p is string => !!p,
    );
    if (phoneLogins.length <= 0) {
      return [];
    }
    const sql = `
      SELECT DISTINCT 
        vu.user as id, 
        vu.full_name as displayName,
        vu.phone_login as phonelogin
      FROM vicidial_users vu 
      WHERE vu.active = 'Y' 
      AND vu.user_group NOT IN ('DESARROLLO', 'DEMO')
      AND vu.full_name REGEXP '[^0-9]'
      AND vu.full_name IS NOT NULL
      AND vu.phone_login IN (:phoneLogins)
      ORDER BY vu.full_name
    `;
    const results = await this.centralConnection.query<AdvisorItemInfo>(sql, {
      type: QueryTypes.SELECT,
      replacements: { phoneLogins },
    });
    const validPhoneLogins = new Set(results.map((r) => r.phonelogin));
    const filteredAdvisors: AdvisorItemInfo[] = Advisors.filter((a) =>
      validPhoneLogins.has(a.phoneLogin),
    ).map((a) => {
      const item = new AdvisorItemInfo();
      item.id = a.username;
      item.displayName = a.user?.displayName ?? '';
      item.phonelogin = a.phoneLogin;
      return item;
    });
    return filteredAdvisors;
  }
  async getAdvisorByPhoneLogin(phoneLogin: string) {
    try {
      const sql = `
      SELECT DISTINCT 
        vu.user as id, 
        vu.full_name as displayName
      FROM vicidial_users vu 
      WHERE vu.active = 'Y' 
      AND vu.phone_login = '${phoneLogin}'
      AND vu.user_group NOT IN ('DESARROLLO', 'DEMO')
      AND vu.full_name REGEXP '[^0-9]'
      AND vu.full_name IS NOT NULL
      ORDER BY vu.full_name
    `;

      //console.log("============================ DEBUG ADVISORS ===============================");
      //console.log("SQL:", sql);

      const results = await this.centralConnection.query<AdvisorItem>(sql, {
        type: QueryTypes.SELECT,
      });
      if (results.length == 0) {
        return null;
      }
      return results[0] as AdvisorItem;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
