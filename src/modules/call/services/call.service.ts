import { CallStateRepository } from '../repositories/call-state.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CallRepository } from '../repositories/call.repository';
import { User } from '@modules/user/entities/user.entity';
import { Op, QueryTypes } from 'sequelize';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Sequelize } from 'sequelize-typescript';
import {
  AdvisorItem,
  AdvisorItemInfo,
  CallItemNew,
  CallItemRow,
  CallStateItem,
} from '../dto/call-collection.dto';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { AdvisorDTO } from '../../vicidial/ami/dto/ami.dto';
import { CallHistoryRepository } from '../repositories/call-history.repository';
import { CallHistory } from '../entities/call-history.entity';
import { DatabaseCentralService } from '@database/central/database-central.service';

const callstates = {
  XFER: 'Transferidas',
  DROP: 'Abandonadas',
  SALE: 'Atendidas',
  QUEUE: 'En cola',
  IVR: 'Llamadas en IVR',
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
    private readonly callHistoryRepository: CallHistoryRepository,
    private readonly dbCentralService: DatabaseCentralService,
  ) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  async getCallHistory(
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponse<CallHistory & { callSateName: string }>> {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

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
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

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
        WHEN status IN ('DISPO', 'DROP', 'NA', 'NOANSWER', 'ABANDON', 'TIMEOUT') THEN 'DROP'
        WHEN status IN ('SALE', 'COMPLETE', 'ANSWERED', 'CBHOLD', 'FINISHED') THEN 'SALE'
        WHEN status IN ('QUEUE', 'INQUEUE', 'WAITING') THEN 'QUEUE'
        WHEN status IN ('ESCALATED', 'TRANSFER', 'XFER') THEN 'XFER'
        ELSE 'SALE'
      END AS call_category
    FROM (
        /*==========================================
          Llamadas salientes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
         	rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas salientes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log_archive vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log_archive vl ON vl.user = u.user
        inner JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}
    ) AS llamadas
    `;

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

    const [totalResult] = await this.db!.query<{
      total: number;
    }>(totalSQL, { replacements: [], type: QueryTypes.SELECT });

    const results = await this.db!.query<CallItemRow>(sql, {
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
  }

  async getCallsFromVicidialByUser(
    user: User,
    limit?: number,
    offset?: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<CallItemNew>> {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

    const search = q?.search;

    const startDate = q?.startDate;

    const endDate = q?.endDate;

    const stateId = q?.stateId;

    const vUsers = (
      await this.vicidialUserRepository.findAll({
        attributes: ['username'],
        include: [{ model: User, as: 'user' }],
        where: { userId: user.id },
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
        WHEN status IN ('DISPO', 'DROP', 'NA', 'NOANSWER', 'ABANDON', 'TIMEOUT') THEN 'DROP'
        WHEN status IN ('SALE', 'COMPLETE', 'ANSWERED', 'CBHOLD', 'FINISHED') THEN 'SALE'
        WHEN status IN ('QUEUE', 'INQUEUE', 'WAITING') THEN 'QUEUE'
        WHEN status IN ('ESCALATED', 'TRANSFER', 'XFER') THEN 'XFER'
        ELSE 'SALE'
      END AS call_category
    FROM (
        /*==========================================
          Llamadas salientes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
         	rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas salientes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log_archive vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log_archive vl ON vl.user = u.user
        inner JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}
    ) AS llamadas
    `;

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

    const [totalResult] = await this.db!.query<{
      total: number;
    }>(totalSQL, { replacements: [], type: QueryTypes.SELECT });

    const results = await this.db!.query<CallItemRow>(sql, {
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
  }

  async getCallsCountersFromVicidial(q?: Record<string, any>) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
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
        WHEN status IN ('DISPO', 'DROP', 'NA', 'NOANSWER', 'ABANDON', 'TIMEOUT') THEN 'DROP'
        WHEN status IN ('SALE', 'COMPLETE', 'ANSWERED', 'CBHOLD', 'FINISHED') THEN 'SALE'
        WHEN status IN ('QUEUE', 'INQUEUE', 'WAITING') THEN 'QUEUE'
        WHEN status IN ('ESCALATED', 'TRANSFER', 'XFER') THEN 'XFER'
        ELSE 'SALE'
      END AS call_category
    FROM (
        /*==========================================
          Llamadas salientes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
         	rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas salientes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log_archive vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log_archive vl ON vl.user = u.user
        inner JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}
    ) AS llamadas
    `;

    const groupSQL = `
      SELECT calls.call_category as callStatus, COUNT(*) AS total
      FROM (${mainSql}) as calls
      GROUP BY call_category;
    `;

    const resumenRaw = await this.db!.query<{
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

  async getCallsCounterByNow() {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

    const startDay = new Date();
    startDay.setHours(0, 0, 0);
    const endDay = new Date(startDay);
    endDay.setHours(23, 59, 59);

    // Convertir a formato SQL (YYYY-MM-DD HH:MM:SS)
    const formatDateForSQL = (date) => {
      const localDate = new Date(date.getTime() - 5 * 60 * 60 * 1000);
      return localDate.toISOString().slice(0, 19).replace('T', ' ');
    };

    const vUsers = (
      await this.vicidialUserRepository.findAll({
        attributes: ['username'],
        include: [{ model: User, as: 'user' }],
      })
    ).map((u) => u.toJSON());

    let usernames = vUsers.map((u) => `'${u.username}'`).join(',');

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
        WHEN status IN ('DISPO', 'DROP', 'NA', 'NOANSWER', 'ABANDON', 'TIMEOUT') THEN 'DROP'
        WHEN status IN ('SALE', 'COMPLETE', 'ANSWERED', 'CBHOLD', 'FINISHED') THEN 'SALE'
        WHEN status IN ('QUEUE', 'INQUEUE', 'WAITING') THEN 'QUEUE'
        WHEN status IN ('ESCALATED', 'TRANSFER', 'XFER') THEN 'XFER'
        ELSE 'SALE'
      END AS call_category
    FROM (
        /*==========================================
          Llamadas salientes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
         	rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes (tabla principal)
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log val ON val.uniqueid = vl.uniqueid
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas salientes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'OUTBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_log_archive vl ON vl.user = u.user
        INNER JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}

        UNION ALL

        /*==========================================
          Llamadas entrantes archivadas
        ==========================================*/
        SELECT
            vl.lead_id,
            'INBOUND' AS call_type,
            vl.call_date,
            vl.user,
            vl.phone_number,
            vl.status,
            COALESCE(vcs.status_name, vs.status_name) AS status_name,
            vl.length_in_sec,
            val.campaign_id,
            rl.recording_id,
            rl.filename,
            rl.location AS recording_location
        FROM vicidial_users u
        INNER JOIN vicidial_closer_log_archive vl ON vl.user = u.user
        inner JOIN vicidial_agent_log_archive val ON val.lead_id = vl.lead_id
        LEFT JOIN recording_log rl ON rl.lead_id = vl.lead_id
        LEFT JOIN vicidial_statuses vs ON vl.status = vs.status
        LEFT JOIN vicidial_campaign_statuses vcs ON vl.status = vcs.status AND val.campaign_id = vcs.campaign_id
        WHERE ${whereOption.join(' AND ')}
    ) AS llamadas
    `;

    const groupSQL = `
      SELECT calls.call_category as callStatus, SUM(length_in_sec) AS duration, COUNT(*) AS total
      FROM (${mainSql}) as calls
      GROUP BY call_category;
    `;

    const resumenRaw = await this.db!.query<{
      callStatus: string;
      duration: number;
      total: number;
    }>(groupSQL, { replacements: [], type: QueryTypes.SELECT });

    const ESTADOS = ['QUEUE', 'DROP', 'XFER', 'SALE', 'IVR'];

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

  async getCallsCounterByNowAndUsers(userNames: string[]) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

    const startDay = new Date();
    startDay.setHours(0, 0, 0);
    const endDay = new Date(startDay);
    endDay.setHours(23, 59, 59);

    // Convertir a formato SQL (YYYY-MM-DD HH:MM:SS)
    const formatDateForSQL = (date) => {
      const localDate = new Date(date.getTime() - 5 * 60 * 60 * 1000);
      return localDate.toISOString().slice(0, 19).replace('T', ' ');
    };

    let usernames = '';

    if (!userNames || userNames.length === 0) {
      const vUsers = (
        await this.vicidialUserRepository.findAll({
          attributes: ['username'],
          include: [{ model: User, as: 'user' }],
        })
      ).map((u) => u.toJSON());

      usernames = vUsers.map((u) => `'${u.username}'`).join(',');
    } else {
      usernames = Array.isArray(userNames)
        ? userNames.map((name) => `'${name}'`).join(',')
        : `'${userNames}'`;
    }

    let whereOption = [`user IN (${usernames})`];

    if (startDay && endDay) {
      whereOption.push(
        `call_date BETWEEN '${formatDateForSQL(startDay)}' AND '${formatDateForSQL(endDay)}'`,
      );
    }

    const groupSQL = `
      WITH calls_base AS (
          /* ===============================
            OUTBOUND
          =============================== */
          SELECT
              lead_id,
              uniqueid,
              'OUTBOUND' AS call_type,
              call_date,
              user,
              phone_number,
              status,
              length_in_sec,
              campaign_id AS group_id
          FROM vicidial_log
          WHERE ${whereOption.join(' AND ')}

          UNION ALL

          SELECT
              lead_id,
              uniqueid,
              'OUTBOUND',
              call_date,
              user,
              phone_number,
              status,
              length_in_sec,
              campaign_id
          FROM vicidial_log_archive
          WHERE ${whereOption.join(' AND ')}

          UNION ALL

          /* ===============================
            INBOUND
          =============================== */
          SELECT
              lead_id,
              uniqueid,
              'INBOUND',
              call_date,
              user,
              phone_number,
              status,
              length_in_sec,
              campaign_id
          FROM vicidial_closer_log
          WHERE ${whereOption.join(' AND ')}

          UNION ALL

          SELECT
              lead_id,
              uniqueid,
              'INBOUND',
              call_date,
              user,
              phone_number,
              status,
              length_in_sec,
              campaign_id
          FROM vicidial_closer_log_archive
          WHERE ${whereOption.join(' AND ')}
      ),

      calls_enriched AS (
          SELECT
              c.*,
              COALESCE(ei.cod_opcion, 0) AS score,
              CASE
                  WHEN c.status IN ('DISPO','DROP','NA','NOANSWER','ABANDON','TIMEOUT') THEN 'DROP'
                  WHEN c.status IN ('SALE','COMPLETE','ANSWERED','CBHOLD','FINISHED') THEN 'SALE'
                  WHEN c.status IN ('QUEUE','INQUEUE','WAITING') THEN 'QUEUE'
                  WHEN c.status IN ('ESCALATED','TRANSFER','XFER') THEN 'XFER'
                  ELSE 'SALE'
              END AS call_category
          FROM calls_base c
          LEFT JOIN CentralTelefonica.encuesta_ivr ei
                ON ei.id_llamada = c.uniqueid
      )

      SELECT
          c.user,
          c.call_category AS callStatus,
          SUM(c.length_in_sec) AS duration,
          COUNT(*) AS total,
          ROUND(
              SUM(CASE WHEN c.score = 1 THEN 1 ELSE 0 END)
              / NULLIF(SUM(CASE WHEN c.score IN (1,9) THEN 1 ELSE 0 END),0),
              2
          ) AS porcentaje_aprobacion
      FROM calls_enriched c
      LEFT JOIN recording_log rl
            ON rl.lead_id = c.lead_id
      LEFT JOIN vicidial_statuses vs
            ON vs.status = c.status
      GROUP BY
          c.user, c.call_category;
    `;

    const resumenRaw = await this.db!.query<{
      user: string;
      callStatus: string;
      duration: number;
      total: number;
      porcentaje_aprobacion: number;
    }>(groupSQL, { replacements: [], type: QueryTypes.SELECT });

    const ESTADOS = ['QUEUE', 'DROP', 'XFER', 'SALE', 'IVR'];

    // Normalizamos el resultado, garantizando que todos los estados estén presentes
    const resumen = userNames
      .map((user) => {
        const estado = ESTADOS.map((status) => {
          const item = resumenRaw.find(
            (r) => r.callStatus === status && r.user === user,
          );
          return {
            user,
            callStatus: status,
            callStateName: callstates[status],
            duration: item ? Number(item.duration) : 0,
            total: item ? Number(item.total) : 0,
            aprobacion: item ? Number(item.porcentaje_aprobacion) : 0,
          };
        });
        return estado;
      })
      .flat();

    return {
      calls: resumen,
      total: resumen.reduce((acc, item) => acc + item.total, 0),
      queueTotal:
        resumen
          .filter((item) => item.callStatus == 'QUEUE')
          .reduce((acc, item) => acc + item.total, 0) ?? 0,
      saleTotal:
        resumen
          .filter((item) => item.callStatus == 'SALE')
          .reduce((acc, item) => acc + item.total, 0) ?? 0,
    };
  }

  async findByCategories() {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

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
    const advisors = advisorJson.map((a) => a.user);
    return advisors;
  }
  async GetAdvisorsInfo() {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
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
    const results = await this.db!.query<AdvisorItemInfo>(sql, {
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
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
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

      const results = await this.db!.query<AdvisorItem>(sql, {
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
