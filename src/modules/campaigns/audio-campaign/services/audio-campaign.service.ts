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

/**
 * Service layer for managing AudioCampaigns.
 *
 * This class provides business logic and delegates persistence operations
 * to the AudioCampaignRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class AudioCampaignService {
  constructor(private readonly repository: AudioCampaignRepository) {}

  /**
   *  Retrieves a paginated list of campaigns.
   * @param user The user requesting the campaigns
   * @param limit Maximum number of records to return
   * @param offset Starting point for pagination
   * @param q Optional filter object
   * @returns Paginated list of campaigns
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<AudioCampaign>> {
    try {
      return this.repository.findAndCountAll({
        include: [{ model: Department }, { model: User, as: 'createdByUser' }],
        limit,
        offset,
        order: [['id', 'DESC']],
      });
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
