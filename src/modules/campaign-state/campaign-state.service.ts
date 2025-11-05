import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCampaignStateDto } from './dto/create-campaign-state.dto';
import { UpdateCampaignStateDto } from './dto/update-campaign-state.dto';
import { CampaignStateRepository } from './repositories/campaign-state.repository';
import { CampaignState } from './entities/campaign-state.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';

/**
 * Service layer for managing Campaign State.
 *
 * This class provides business logic and delegates persistence operations
 * to the CampaignStateRepository. It handles CRUD, bulk operations,
 * status toggling, and soft deletion/restoration.
 */
@Injectable()
export class CampaignStateService {
  constructor(private readonly repository: CampaignStateRepository) {}

  /**
   * Retrieves a paginated list of campaign states.
   * @param user Current authenticated user
   * @param limit Maximum number of results per page
   * @param offset Starting point for pagination
   * @param q Optional filters
   * @returns PaginatedResponse containing campaign states
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<CampaignState>> {
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
   * Finds a campaign state by its ID.
   * @param id CampaignState identifier
   * @returns The CampaignState entity if found
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<CampaignState> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('Campaign state not found');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Creates a new campaign state.
   * @param dto Data Transfer Object containing campaign state data
   * @returns The created CampaignState entity
   */
  async create(dto: CreateCampaignStateDto): Promise<CampaignState> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Updates an existing campaign state by ID.
   * @param id CampaignState identifier
   * @param dto Data to update
   * @returns Updated CampaignState entity
   */
  async update(
    id: number,
    dto: UpdateCampaignStateDto,
  ): Promise<CampaignState> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }

  /**
   * Toggles the status (active/inactive) of a campaign state.
   * @param id CampaignState identifier
   * @returns CampaignState entity with updated status
   */
  async toggleStatus(id: number): Promise<CampaignState> {
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
   * Deletes (soft delete) a campaign state by its ID.
   * @param id CampaignState identifier
   * @returns void
   */
  remove(id: number): Promise<void> {
    try {
      return this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Internal server error');
    }
  }
}
