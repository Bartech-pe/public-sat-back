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
    console.log("findAll")
    return this.model.findAll();
  }

  async createCampaign(body: CreateVicidialCampaignDto): Promise<{
    status: 'created' | 'exists';
    data: VicidialCampaign;
  }>{
      const { campaign_id, campaign_name } = body;

      console.log("=============================================");
      console.log(body);

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

  //sudo chown -R ese_usuario:ese_usuario /var/lib/asterisk/sounds
  //sudo chmod -R 775 /var/lib/asterisk/sounds


}
