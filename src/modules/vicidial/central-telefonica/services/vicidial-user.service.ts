import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { CreateVicidialCampaignDto } from '../dto/create-vicidial-campaing.dto';
import { UpdateVicidialCampaignDto } from '../dto/update-vicidial-campaing.dto';
import { Sequelize } from 'sequelize';

@Injectable()
export class VicidialUserService {
  constructor(
    @InjectModel(VicidialUser, 'central')
    private readonly model: typeof VicidialUser,
    @InjectModel(VicidialCampaign, 'central')
    private readonly campaignModel: typeof VicidialCampaign,
     @InjectConnection('central') private readonly centralConnection: Sequelize, 
  ) {}

  findAll(): Promise<VicidialUser[]> {
    return this.model.findAll();
  }

  getCampaignAll(): Promise<VicidialCampaign[]> {
    return this.campaignModel.findAll({ where: { dial_method: 'RATIO' }});
  }

   async getByIdCampain(campaignId: string) {
    const campaign = await this.campaignModel.findOne({
      where: { campaign_id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`La campaña con ID ${campaignId} no fue encontrada`);
    }

    return campaign;
  }

  async createCampaign(body: CreateVicidialCampaignDto): Promise<{
    status: 'created' | 'exists';
    data: VicidialCampaign;
  }>{
      const { campaign_id, campaign_name } = body;

      const existing = await this.campaignModel.findOne({ where: { campaign_id } });

      if (existing) {
        return {
          status: 'exists',
          data: existing,
        };
      }

      const created = await this.campaignModel.create({
        campaign_id,
        campaign_name,
      });

      return {
        status: 'created',
        data: created,
      };
  }

  async updateCampaign(campaign_id: string, dto: UpdateVicidialCampaignDto): 
  Promise< | { status: 'updated'; data: VicidialCampaign } | { status: 'not_found' }> {
    try {
      const exist = await this.campaignModel.findOne({
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

  async deleteCampaign(campaign_id: string): Promise< | { status: 'deleted'; data: VicidialCampaign }| { status: 'not_found' }> {
      try {
        const campaign = await this.campaignModel.findOne({
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
      const [results] = await this.centralConnection.query(sql, {
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
      const [results] = await this.centralConnection.query(sql_datos, {
        replacements: [listId],
        type: 'SELECT',
      });

      const detalle = await this.centralConnection.query(sqlDetalle, {
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
    const sql = `
      SELECT 
        remote_agent_id, 
        server_ip
      FROM vicidial_remote_agents
      WHERE campaign_id = ?
    `;

    try {
      const [results] = await this.centralConnection.query(sql, {
        replacements: [campaign_id],
        type: 'SELECT',
      });

      return results;
    } catch (error) {
      console.error('Error al obtener los agentes remotos:', error);
      throw new InternalServerErrorException('Error al obtener los agentes remotos de Vicidial');
    }
}


}
