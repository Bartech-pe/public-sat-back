import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { UpdateCampaignDto } from '../dto/update-campaign.dto';
import { CampaignRepository } from '../repositories/campaign.repository';
import { Campaign } from '../entities/campaign.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { CampaignType } from '@modules/campaign-type/entities/campaign-type.entity';
import { Department } from '@modules/department/entities/department.entity';
import { CampaignState } from '@modules/campaign-state/entities/campaign-state.entity';

/**
 * Service layer for managing Campaigns.
 *
 * This class provides business logic and delegates persistence operations
 * to the CampaignRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class CampaignService {
  constructor(private readonly repository: CampaignRepository) {}

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
  ): Promise<PaginatedResponse<Campaign>> {
    try {
      return this.repository.findAndCountAll({
        include: [
          { model: CampaignType },
          { model: Department },
          { model: CampaignState },
          { model: User, as: 'createdByUser' },
        ],
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
   * @param id Campaign identifier
   * @throws NotFoundException if campaign does not exist
   * @returns Campaign entity
   */
  async findOne(id: number): Promise<Campaign> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('Campaign not found');
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
  async create(dto: CreateCampaignDto): Promise<Campaign> {
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
  async bulkCreate(dtoList: CreateCampaignDto[]): Promise<Campaign[]> {
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
   * @param id Campaign identifier
   * @param dto Data to update
   * @returns Updated campaign
   */
  async update(id: number, dto: UpdateCampaignDto): Promise<Campaign> {
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
   * @param id Campaign identifier
   * @returns Updated campaign with new status
   */
  async toggleStatus(id: number): Promise<Campaign> {
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
   * @param id Campaign identifier
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
   * @param id Campaign identifier
   */
  restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }
}
