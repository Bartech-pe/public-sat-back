import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAudioCampaignDto } from '../dto/create-audio-campaign.dto';
import { UpdateAudioCampaignDto } from '../dto/update-audio-campaign.dto';
import { AudioCampaignRepository } from '../repositories/audio-campaign.repository';
import { AudioCampaign } from '../entities/audio-campaign.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { Department } from '@modules/department/entities/department.entity';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { Sequelize } from 'sequelize';
/**
 * Service layer for managing AudioCampaigns.
 *
 * This class provides business logic and delegates persistence operations
 * to the AudioCampaignRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class AudioCampaignService {
  constructor(
    private readonly dbCentralService: DatabaseCentralService,
    private readonly repository: AudioCampaignRepository) {}

  /**
   *  Retrieves a paginated list of campaigns.
   * @param user The user requesting the campaigns
   * @param limit Maximum number of records to return
   * @param offset Starting point for pagination
   * @param q Optional filter object
   * @returns Paginated list of campaigns
   */

  private get db(): Sequelize | null {
      return this.dbCentralService.getConnection();
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

  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<AudioCampaign>> {
    try {

        const audioCampaign = await this.repository.findAndCountAll({
            include: [{ model: Department }, { model: User, as: 'createdByUser' }],
            limit,
            offset,
            order: [['id', 'DESC']],
        });

        await Promise.all(
          audioCampaign.data.map(async (element) => {
              const vdlistId = element.dataValues.vdlistId;
            element.dataValues.result = await this.getProgresoLive(vdlistId);
          }),
        );
        
        return audioCampaign;

    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Finds a campaign by its ID.
   * @param id AudioCampaign identifier
   * @throws NotFoundException if campaign does not exist
   * @returns AudioCampaign entity
   */
  async findOne(id: number): Promise<AudioCampaign> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('AudioCampaign not found');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Creates a new campaign.
   * @param dto Data Transfer Object containing campaign data
   * @returns Newly created campaign
   */
  async create(dto: CreateAudioCampaignDto): Promise<AudioCampaign> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Creates multiple campaigns in bulk.
   * @param dtoList List of campaign DTOs
   * @returns List of created campaigns
   */
  async bulkCreate(
    dtoList: CreateAudioCampaignDto[],
  ): Promise<AudioCampaign[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );
      return this.repository.bulkCreate(securedDtoList, {});
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Updates an existing campaign by its ID.
   * @param id AudioCampaign identifier
   * @param dto Data to update
   * @returns Updated campaign
   */
  async update(
    id: number,
    dto: UpdateAudioCampaignDto,
  ): Promise<AudioCampaign> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Toggles the "status" field of a campaign (active/inactive).
   * @param id AudioCampaign identifier
   * @returns Updated campaign with new status
   */
  async toggleStatus(id: number): Promise<AudioCampaign> {
    try {
      const exist = await this.repository.findById(id);

      const status = !exist.get().status;

      exist.update({ status });

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Soft deletes a campaign by its ID.
   * @param id AudioCampaign identifier
   */
  remove(id: number): Promise<void> {
    try {
      return this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Restores a previously deleted campaign by its ID.
   * @param id AudioCampaign identifier
   */
  restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }
}
