import { CallStateRepository } from '../repositories/call-state.repository';
import {
  Injectable,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { CallRepository } from '../repositories/call.repository';
import { CallFilter } from '../dto/call-filter.dto';
import { User } from '@modules/user/entities/user.entity';
import { Op, QueryTypes } from 'sequelize';
import {
  DataCollection,
  GetPages,
  PaginatedResponse,
} from '@common/interfaces/paginated-response.interface';
import { Sequelize } from 'sequelize-typescript';
import {
  AdvisorItem,
  AdvisorItemInfo,
  CallItemRow,
  CallStateItem,
  StateCountItems,
  StateCountQuery,
} from '../dto/call-collection.dto';
import { InjectConnection } from '@nestjs/sequelize';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { AdvisorDTO } from '../../vicidial/ami/dto/ami.dto';
import { CallHistoryRepository } from '../repositories/call-history.repository';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { CallHistory } from '../entities/call-history.entity';

function getPages(limit: number, total: number): number {
  return Math.ceil(total / (limit || 1));
}

@Injectable()
export class CallService {
  constructor(
    private readonly repository: CallRepository,
    private readonly stateRepository: CallStateRepository,
    private readonly userRepository: VicidialUserRepository,
    @InjectConnection('central') private readonly centralConnection: Sequelize,
    private readonly callHistoryRepository: CallHistoryRepository,
  ) {}

  async getCallHistory(
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<CallHistory>> {
    return this.callHistoryRepository.findAndCountAll({
      include: [{ model: User, as: 'user' }],
      limit,
      offset,
    });
  }

  async getCallsFromVicidial(filter: CallFilter) {
    const where: string[] = [];
    const replacements: any[] = [];

    // === Filtros dinámicos ===
    if (filter.startDate && filter.endDate) {
      where.push(
        `(COALESCE(rl.start_time, vl.last_local_call_time) BETWEEN ? AND ?)`,
      );
      replacements.push(filter.startDate, filter.endDate);
    }

    if (filter.search && filter.search.trim() !== '') {
      where.push(
        `(vu.full_name LIKE ? OR vl.phone_number LIKE ? OR vu.full_name IS NULL)`,
      );
      replacements.push(`%${filter.search}%`, `%${filter.search}%`);
    }

    if (filter.advisor && filter.advisor !== '') {
      where.push(`(vu.user LIKE ? OR vu.user IS NULL)`);
      replacements.push(`%${filter.advisor}%`);
    }

    // === Estado ===
    if (filter.stateId && filter.stateId > 0) {
      if (filter.stateId === 1) {
        where.push(`
          (vcl.status IN ('01','02','03','04','05','06','1','2','3','4','5','6','SALE','A','CALLBK','INTERESTED','CONTACT','INFO','DISPO'))
        `);
      } else if (filter.stateId === 2) {
        where.push(`
          (vcl.status IN ('07','08','09','10','11','12','13','7','8','9','DROP','HANGUP','BUSY','NA','N','MAXCAL','ABANDON'))
        `);
      } else if (filter.stateId === 3) {
        where.push(`
          (vcl.status IN ('14','15','16','17','QUEUE','TIMEOT','XFER','INCALL','CBHOLD'))
        `);
      }
    }

    // === Filtros de validez (agente + fecha + duración) ===
    where.push(`
      (vu.user IS NOT NULL)
      AND (COALESCE(rl.start_time, vl.last_local_call_time) IS NOT NULL)
      AND (COALESCE(rl.length_in_sec, 0) > 0)
    `);

    // ===================================
    // === CTEs para logs y estado =======
    // ===================================
    const cte = `
      WITH vcl AS (
        SELECT lead_id, status, user FROM vicidial_closer_log
        UNION ALL
        SELECT lead_id, status, user FROM vicidial_closer_log_archive
      ),
      vlogs AS (
        SELECT lead_id, user FROM vicidial_log
        UNION ALL
        SELECT lead_id, user FROM vicidial_log_archive
      )
    `;

    // ===================================
    // === TOTAL DE REGISTROS ============
    // ===================================
    const totalSQL = `
      ${cte}
      SELECT COUNT(*) AS total
      FROM vicidial_list vl
      LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
      LEFT JOIN vcl ON vcl.lead_id = vl.lead_id
      LEFT JOIN vlogs ON vlogs.lead_id = vl.lead_id
      LEFT JOIN vicidial_users vu 
        ON vu.user = COALESCE(rl.user, vcl.user, vlogs.user)
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''};
    `;

    const totalResult = await this.centralConnection.query<{ total: number }>(
      totalSQL,
      { replacements, type: QueryTypes.SELECT },
    );
    const total = totalResult[0]?.total ?? 0;

    // ===================================
    // === CONSULTA PRINCIPAL ============
    // ===================================
    const sql = `
      ${cte}
      SELECT
        rl.recording_id,
        vu.full_name,
        vu.user,
        vl.lead_id,
        rl.filename,
        rl.location,
        rl.start_time,
        rl.length_in_sec,
        vl.phone_number,
        vl.list_id,
        CASE 
          WHEN vcl.status IN ('SALE','A','CALLBK','INTERESTED','CONTACT','INFO','DISPO','01','02','03','04','05','06','1','2','3','4','5','6') THEN 'Concluido'
          WHEN vcl.status IN ('DROP','HANGUP','BUSY','NA','N','MAXCAL','ABANDON','07','08','09','10','11','12','13','7','8','9') THEN 'Abandonado'
          WHEN vcl.status IN ('QUEUE','TIMEOT','XFER','INCALL','CBHOLD','14','15','16','17') THEN 'Escalado'
          ELSE 'Concluido'
        END AS status
      FROM vicidial_list vl
      LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
      LEFT JOIN vcl ON vcl.lead_id = vl.lead_id
      LEFT JOIN vlogs ON vlogs.lead_id = vl.lead_id
      LEFT JOIN vicidial_users vu 
        ON vu.user = COALESCE(rl.user, vcl.user, vlogs.user)
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY rl.start_time DESC
      LIMIT ? OFFSET ?;
    `;

    replacements.push(filter.limit ?? 50, filter.offset ?? 0);

    const results = await this.centralConnection.query<CallItemRow>(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const collection: DataCollection<CallItemRow> = {
      items: results,
      total,
      page: Math.floor((filter.offset ?? 0) / (filter.limit ?? 50)) + 1,
      pages: getPages(filter.limit ?? 50, total),
    };

    return collection;
  }

  async getCallsCountersFromVicidial(filter: CallFilter) {
    const where: string[] = [];
    const replacements: any[] = [];

    if (filter.startDate && filter.endDate) {
      where.push(`rl.start_time BETWEEN ? AND ?`);
      replacements.push(filter.startDate, filter.endDate);
    }

    if (filter.search && filter.search.trim() !== '') {
      where.push(`(vu.full_name LIKE ? OR vu.full_name IS NULL)`);
      replacements.push(`%${filter.search}%`);
    }

    if (filter.advisor && filter.advisor !== '') {
      where.push(`(vu.user LIKE ? OR vu.user IS NULL)`);
      replacements.push(`%${filter.advisor}%`);
    }

    const sql = `
    SELECT
      COUNT(*) as Total,
      SUM(CASE 
        WHEN vcl.status IN ('01', '02', '03', '04', '05', '06', '1', '2', '3', '4', '5', '6', 'SALE', 'A', 'CALLBK', 'INTERESTED', 'CONTACT', 'INFO', 'DISPO') THEN 1
        ELSE 0
      END) as Concluida,
      SUM(CASE 
        WHEN vcl.status IN ('07', '08', '09', '10', '11', '12', '13', '7', '8', '9', 'DROP', 'HANGUP', 'BUSY', 'NA', 'N', 'MAXCAL', 'ABANDON') THEN 1
        ELSE 0
      END) as Abandonado,
      SUM(CASE 
        WHEN vcl.status IN ('14', '15', '16', '17', 'QUEUE', 'TIMEOT', 'XFER', 'INCALL', 'CBHOLD') THEN 1
        ELSE 0
      END) as Escalado
    FROM
      recording_log rl
    LEFT JOIN vicidial_users vu ON vu.user = rl.user
    LEFT JOIN vicidial_list vl ON rl.lead_id = vl.lead_id
    LEFT JOIN (
      SELECT lead_id, status FROM vicidial_closer_log
      UNION ALL
      SELECT lead_id, status FROM vicidial_closer_log_archive
    ) vcl ON vcl.lead_id = rl.lead_id
    ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
  `;

    const results = await this.centralConnection.query<StateCountQuery>(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const count = results[0];
    for (const item of StateCountItems) {
      const key = item.name as keyof StateCountQuery;
      if (count[key] !== undefined) {
        item.total = count[key] ?? 0;
      }
    }
    return StateCountItems;
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
    const getAdvisors = await this.userRepository.findAll({
      attributes: ['phoneLogin'],
      include: [
        {
          model: User,
          as: 'user',
          where: { roleId: 3 },
        },
      ],
    });
    const advisorJson: any[] = getAdvisors.map((a) => a.toJSON());
    const phoneLogins = advisorJson
      .map((a) => a.phoneLogin)
      .filter((p): p is string => !!p);
    if (phoneLogins.length <= 0) {
      return [];
    }
    try {
      const sql = `
      SELECT DISTINCT 
        vu.user as id, 
        vu.full_name as displayName
      FROM vicidial_users vu 
      WHERE vu.active = 'Y' 
      AND vu.user_group NOT IN ('DESARROLLO', 'DEMO')
      AND vu.full_name REGEXP '[^0-9]'
      AND vu.full_name IS NOT NULL
      AND vu.phone_login IN (:phoneLogins)
      ORDER BY vu.full_name
    `;
      const results = await this.centralConnection.query<AdvisorItem>(sql, {
        type: QueryTypes.SELECT,
        replacements: { phoneLogins },
      });
      return results;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  async GetAdvisorsInfo() {
    const getAdvisors = await this.userRepository.findAll({
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
