import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampaignTypeDto } from './dto/create-campaign-type.dto';
import { UpdateCampaignTypeDto } from './dto/update-campaign-type.dto';
import { CampaignType } from './entities/campaign-type.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CampaignTypeRepository } from './repositories/campaign-type.repository';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing Campaign Types.
 *
 * This class provides business logic and delegates persistence operations
 * to the CampaignTypesRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class CampaignTypeService {
  constructor(private readonly repository: CampaignTypeRepository) {}

  /**
   * Retrieves a paginated list of campaign types.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional query filters
   * @returns PaginatedResponse containing campaign types
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<CampaignType>> {
    try {
      return this.repository.findAndCountAll({
        limit,
        offset,
        order: [['id', 'DESC']],
      });
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Finds a campaign type by its ID.
   * @param id CampaignType identifier
   * @returns The campaign type entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<CampaignType> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('Campaign type not found');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Creates a new campaign type.
   * @param dto Data Transfer Object containing the campaign type data
   * @returns The created CampaignType entity
   */
  async create(dto: CreateCampaignTypeDto): Promise<CampaignType> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Creates multiple campaign types in bulk.
   * @param dtoList Array of DTOs for bulk creation
   * @returns Array of created CampaignType entities
   */
  async bulkCreate(dtoList: CreateCampaignTypeDto[]): Promise<CampaignType[]> {
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
   * Updates an existing campaign type by ID.
   * @param id CampaignType identifier
   * @param dto Data to update
   * @returns The updated CampaignType entity
   */
  async update(id: number, dto: UpdateCampaignTypeDto): Promise<CampaignType> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Toggles the status (active/inactive) of a campaign type.
   * @param id CampaignType identifier
   * @returns The updated CampaignType entity with toggled status
   */
  async toggleStatus(id: number): Promise<CampaignType> {
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
   * Deletes (soft delete) a campaign type by its ID.
   * @param id CampaignType identifier
   * @returns void
   */
  remove(id: number): Promise<void> {
    try {
      return this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Restores a previously deleted campaign type by its ID.
   * @param id CampaignType identifier
   * @returns void
   */
  restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }
}
