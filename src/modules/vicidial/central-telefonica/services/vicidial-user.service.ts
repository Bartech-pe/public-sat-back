import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { CreateVicidialCampaignDto } from '../dto/create-vicidial-campaing.dto';
import { UpdateVicidialCampaignDto } from '../dto/update-vicidial-campaing.dto';
import { QueryTypes, Sequelize } from 'sequelize';
import * as cron from 'node-cron';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { VicidialCampaingRepository } from '../repositories/vicidial-campaing.repository';
import { VicidialUserRepository } from '../repositories/vicidial-user.repository';
import { CampaignScheduleRepository } from '@modules/campaigns/campaign-schedule/repositories/campaign-schedule.repository';
import { CampaignSchedule } from '@modules/campaigns/campaign-schedule/entities/campaign-schedule.entity';
import { AudioCampaignRepository } from '@modules/campaigns/audio-campaign/repositories/audio-campaign.repository';

@Injectable()
export class VicidialUserService implements OnModuleInit {
  private readonly logger = new Logger(VicidialUserService.name);
  constructor(
    private readonly dbCentralService: DatabaseCentralService,
    private readonly campaignModel: VicidialCampaingRepository,
    private readonly userModel: VicidialUserRepository,
    private readonly campaignScheduleRepository: CampaignScheduleRepository,
    private readonly audioCampaignRepository: AudioCampaignRepository,
  ) {}

  onModuleInit() {
    this.scheduleCampaign();
  }

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  findAll(): Promise<VicidialUser[]> {
    return this.userModel.getModel()!.findAll();
  }

  getCampaignAll(): Promise<VicidialCampaign[]> {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
    return this.campaignModel
      .getModel()!
      .findAll({ where: { dial_method: 'RATIO' } });
  }

  async getByIdCampain(campaignId: string) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
    const campaign = await this.campaignModel.getModel()!.findOne({
      where: { campaign_id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(
        `La campaña con ID ${campaignId} no fue encontrada`,
      );
    }

    return campaign;
  }

  async createCampaign(body: CreateVicidialCampaignDto): Promise<{
    status: 'created' | 'exists';
    data: VicidialCampaign;
  }> {
    const { campaign_id, campaign_name } = body;
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

    const existing = await this.campaignModel.getModel()!.findOne({
      where: { campaign_id },
    });

    if (existing) {
      return {
        status: 'exists',
        data: existing,
      };
    }

    const created = await this.campaignModel.getModel()!.create({
      campaign_id,
      campaign_name,
    });

    return {
      status: 'created',
      data: created,
    };
  }

  async updateCampaign(
    campaign_id: string,
    dto: UpdateVicidialCampaignDto,
  ): Promise<
    { status: 'updated'; data: VicidialCampaign } | { status: 'not_found' }
  > {
    try {
      if (!this.db) {
        throw new InternalServerErrorException(
          'No se pudo otener la conexión con la base de datos de la central telefónica.',
        );
      }
      const exist = await this.campaignModel.getModel()!.findOne({
        where: { campaign_id },
      });

      if (!exist) {
        return { status: 'not_found' };
      }

      await exist.update(dto);

      return {
        status: 'updated',
        data: exist,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async deleteCampaign(
    campaign_id: string,
  ): Promise<
    { status: 'deleted'; data: VicidialCampaign } | { status: 'not_found' }
  > {
    try {
      if (!this.db) {
        throw new InternalServerErrorException(
          'No se pudo otener la conexión con la base de datos de la central telefónica.',
        );
      }
      const campaign = await this.campaignModel.getModel()!.findOne({
        where: { campaign_id },
      });

      if (!campaign) {
        return { status: 'not_found' };
      }

      await campaign.destroy();

      return {
        status: 'deleted',
        data: campaign,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async getProgreso(campaign_id: string) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
    const sql = `SELECT
                  (SELECT COUNT(*) FROM vicidial_list WHERE list_id IN (
                    SELECT list_id FROM vicidial_lists WHERE campaign_id = ?
                  )) AS total_leads,
                  (SELECT COUNT(*) FROM vicidial_log WHERE campaign_id = ?) AS llamadas_realizadas,
                  (SELECT COUNT(*) FROM vicidial_list WHERE called_since_last_reset = 'N' AND list_id IN (
                    SELECT list_id FROM vicidial_lists WHERE campaign_id = ?
                  )) AS llamadas_pendientes,
                  (SELECT COUNT(*) FROM vicidial_live_agents WHERE campaign_id = ?) AS agentes_conectados`;

    try {
      const [results] = await this.db.query(sql, {
        replacements: [campaign_id, campaign_id, campaign_id, campaign_id],
        type: 'SELECT',
      });

      return results;
    } catch (error) {
      console.error('Error al obtener el progreso:', error);
      throw new InternalServerErrorException('Error al obtener el progreso');
    }
  }

  async getListProgress(listId: number) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
    const sql_datos = `SELECT 
            vl.list_id,
            vl.list_name,
            vc.campaign_id,
            vc.campaign_name,
            COUNT(vl2.lead_id) AS total_leads,
            SUM(CASE WHEN vl2.status = 'NEW' THEN 1 ELSE 0 END) AS not_called,
            SUM(CASE WHEN vl2.status != 'NEW' THEN 1 ELSE 0 END) AS called,
            ROUND(SUM(CASE WHEN vl2.status != 'NEW' THEN 1 ELSE 0 END) / COUNT(vl2.lead_id) * 100, 2) AS penetration
        FROM vicidial_lists vl
        JOIN vicidial_list vl2 ON vl.list_id = vl2.list_id
        JOIN vicidial_campaigns vc ON vl.campaign_id = vc.campaign_id
        WHERE vl.list_id = ?
        GROUP BY vl.list_id, vl.list_name, vc.campaign_id, vc.campaign_name`;

    const sqlDetalle = `
        SELECT 
            vl2.status AS estado,
            vs.status_name AS nombre_estado,
            COUNT(*) AS subtotal
        FROM vicidial_list vl2
        LEFT JOIN vicidial_statuses vs ON vl2.status = vs.status
        WHERE vl2.list_id = ?
        GROUP BY vl2.status, vs.status_name
      `;

    try {
      const [results] = await this.db.query(sql_datos, {
        replacements: [listId],
        type: 'SELECT',
      });

      const detalle = await this.db.query(sqlDetalle, {
        replacements: [listId],
        type: 'SELECT',
      });

      const detalleFormateado = detalle.map((row: any) => ({
        estado: row.estado || 'Total',
        nombre_estado: row.nombre_estado || '',
        subtotal: row.subtotal,
      }));

      return {
        resumen: results,
        detalle: detalleFormateado,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el progreso');
    }
  }

  async getVicidialRemoteAgents(campaign_id: any) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
    const sql = `
      SELECT 
        remote_agent_id, 
        server_ip
      FROM vicidial_remote_agents
      WHERE campaign_id = ?
    `;

    try {
      const [results] = await this.db.query(sql, {
        replacements: [campaign_id],
        type: 'SELECT',
      });

      return results;
    } catch (error) {
      console.error('Error al obtener los agentes remotos:', error);
      throw new InternalServerErrorException(
        'Error al obtener los agentes remotos de Vicidial',
      );
    }
  }

  async scheduleCampaign() {
    console.log('scheduleCampaign');
    // se ejecuta cada 5 minutos
    cron.schedule('*/1 * * * *', async () => {
      if (!this.db) {
        this.logger.error(
          'No se pudo obtener la conexión con la base de datos de la central telefónica.',
        );
        return;
      }

      const now = new Date();

      const schedules = await this.campaignScheduleRepository.findAll();

      const schedule = schedules
        .map((s) => s.toJSON())
        .find((s: CampaignSchedule) => {
          const startDay = parseInt(s.intervalDays.split('-')[0]);
          const endDay = parseInt(s.intervalDays.split('-')[1]);
          const start = new Date(now);
          const startHours = parseInt(s.startTime.split(':')[0]);
          const startMinutes = parseInt(s.startTime.split(':')[1]);
          start.setHours(startHours, startMinutes, 0, 0);
          const end = new Date(now);
          const endHours = parseInt(s.endTime.split(':')[0]);
          const endMinutes = parseInt(s.endTime.split(':')[1]);
          end.setHours(endHours, endMinutes, 0, 0);
          return (
            now.getTime() >= start.getTime() &&
            now.getTime() <= end.getTime() &&
            now.getDay() >= startDay &&
            now.getDay() <= endDay
          );
        });

      console.log('schedule', now, schedule);

      const audioCampaignsList = (
        await this.audioCampaignRepository.findAll({
          where: {
            active: 'Y',
          },
        })
      ).map((c) => c.toJSON());

      if (audioCampaignsList.length === 0) return;

      const vdlistIds: number[] = audioCampaignsList.map((c) => c.vdlistId);

      await this.ensureSingleActiveList(vdlistIds, !!schedule);

      // let active = 'N';
      // if (schedule) {
      //   active = 'Y';
      // }
      // const listCampaignRatio2 = await this.campaignModel.getModel()!.findAll({
      //   where: { dial_method: 'RATIO' },
      //   attributes: ['campaign_id'],
      // });
      // const CAMPAIGNS = listCampaignRatio2.map((c) =>
      //   c.getDataValue('campaign_id'),
      // );
      // await this.db!.query(
      //   `UPDATE vicidial_campaigns
      //      SET active = :active
      //      WHERE campaign_id IN (:campaigns)`,
      //   { replacements: { active, campaigns: CAMPAIGNS } },
      // );
      // if (active === 'Y') {
      //   for (const campaignId of CAMPAIGNS) {
      //     await this.ensureSingleActiveList(campaignId);
      //   }
      // }
    });
  }

  private async ensureSingleActiveList(vdlistIds: number[], isActive: boolean) {
    try {
      const listaPendiente = await this.db!.query<CampaignList>(
        `
              SELECT vl.list_id,
                    vl.list_name,
                    vl.active,
                    CAST(SUM(CASE WHEN vll.status = 'NEW' THEN 1 ELSE 0 END) AS SIGNED) AS leads_pendientes,
                    CAST(COUNT(vll.lead_id) AS SIGNED) AS total
              FROM vicidial_lists vl
              LEFT JOIN vicidial_list vll ON vll.list_id = vl.list_id
              WHERE vl.list_id IN (:listIds) AND vl.active = :active
              GROUP BY vl.list_id
              HAVING leads_pendientes > 0
              ORDER BY vl.list_id ASC
            `,
        {
          replacements: { listIds: vdlistIds, active: isActive ? 'N' : 'Y' },
          type: QueryTypes.SELECT,
        },
      );

      console.log('listaPendiente', listaPendiente);

      // if (!Array.isArray(lists) || lists.length === 0) return;

      // const listaPendiente = lists.filter((l) => l.leads_pendientes > 0);

      for (const list of listaPendiente) {
        await this.db!.query(
          `UPDATE vicidial_lists SET active = :active WHERE list_id = :id`,
          { replacements: { id: list.list_id, active: isActive ? 'Y' : 'N' } },
        );
        this.logger.warn(
          `Lista ${list.list_name} ${isActive ? 'activada' : 'desactivada'}`,
        );
      }

      // if (listaPendiente) {
      //   // Activar la lista con leads pendientes
      //   await this.db!.query(
      //     `UPDATE vicidial_lists SET active = 'Y' WHERE list_id = :id`,
      //     { replacements: { id: listaPendiente.list_id } },
      //   );

      //   // Desactivar las demás listas
      //   const idsInactivos = listas
      //     .filter((l) => l.list_id !== listaPendiente.list_id)
      //     .map((l) => l.list_id);

      //   if (idsInactivos.length) {
      //     await this.db!.query(
      //       `UPDATE vicidial_lists SET active = 'N' WHERE list_id IN (:ids)`,
      //       { replacements: { ids: idsInactivos } },
      //     );
      //   }

      //   this.logger.log(
      //     `Campaña ${campaignId}: lista activa ${listaPendiente.list_name} (${listaPendiente.list_id})`,
      //   );
      // } else {
      //   // Todas las listas terminadas
      //   await this.db!.query(
      //     `UPDATE vicidial_lists SET active = 'N' WHERE campaign_id = :campaignId`,
      //     { replacements: { campaignId } },
      //   );

      //   this.logger.warn(
      //     `Campaña ${campaignId}: todas las listas completadas.`,
      //   );
      // }
    } catch (err) {
      this.logger.error(`Error al controlar listas`, err);
    }
  }

  async getProgresoLive(listId: number) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
    const sql = `SELECT 
        vl.list_id,
        vl.list_name,
        vc.campaign_id,
        vc.campaign_name,
        COUNT(vl2.lead_id) AS total_leads,
        SUM(CASE WHEN vl2.called_since_last_reset = 'Y' THEN 1 ELSE 0 END) AS numeros_discados,
        SUM(CASE WHEN vl2.status = 'NEW' THEN 1 ELSE 0 END) AS not_called,
        SUM(CASE WHEN vl2.status != 'NEW' THEN 1 ELSE 0 END) AS called,
        ROUND(SUM(CASE WHEN vl2.status != 'NEW' THEN 1 ELSE 0 END) / COUNT(vl2.lead_id) * 100, 2) AS penetration
      FROM vicidial_lists vl
      JOIN vicidial_list vl2 ON vl.list_id = vl2.list_id
      JOIN vicidial_campaigns vc ON vl.campaign_id = vc.campaign_id
      WHERE vl.list_id = ?
      GROUP BY vl.list_id, vl.list_name, vc.campaign_id, vc.campaign_name;`;

    try {
      const [results] = await this.db.query(sql, {
        replacements: [listId],
        type: 'SELECT',
      });

      return results;
    } catch (error) {
      console.error('Error al obtener el progreso:', error);
      throw new InternalServerErrorException('Error al obtener el progreso');
    }
  }

  async getListDetailsByStatus(listId: number) {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }

    const sql = `
            SELECT 
                vl2.lead_id,
                vl2.phone_number,
                vl2.status AS estado,
                vs.status_name AS nombre_estado
            FROM vicidial_list vl2
            LEFT JOIN vicidial_statuses vs ON vl2.status = vs.status
            WHERE vl2.list_id = ?
            ORDER BY vl2.status, vl2.phone_number;
        `;

    try {
      const [results] = await this.db.query(sql, {
        replacements: [listId],
        type: 'SELECT',
      });

      return results;
    } catch (error) {
      console.error('Error al obtener los agentes remotos:', error);
      throw new InternalServerErrorException(
        'Error al obtener los agentes remotos de Vicidial',
      );
    }
  }
}

interface CampaignList {
  list_id: number;
  list_name: string;
  active: string;
  leads_pendientes: number;
  total: number;
}
