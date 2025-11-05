import { Controller, Get } from '@nestjs/common';
import { QuickResponseCategoryService } from '../services/quickResponseCategory.service';

@Controller('quick-response-category')
export class QuickResponseCategoryController {
  constructor(
    private readonly quickResponseCategoryService: QuickResponseCategoryService,
  ) {}
  @Get()
  async getAll() {
    const response = await this.quickResponseCategoryService.GetCategories();
    return response;
  }
}
