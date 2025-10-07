import { Controller, Get } from '@nestjs/common';
import { QuickResponseCategoryService } from '../services/quickResponseCategory.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QuickResponseCategory } from '../entities/quick-response-category.entity';

/**
 * Controller for managing QuickResponseCategory.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for QuickResponseCategory.
 */
@ApiBearerAuth()
@Controller('quick-response-category')
export class QuickResponseCategoryController {
  constructor(
    private readonly quickResponseCategoryService: QuickResponseCategoryService,
  ) {}

  @Get()
  async getAll(): Promise<QuickResponseCategory[]> {
    const response = await this.quickResponseCategoryService.GetCategories();
    return response;
  }
}
