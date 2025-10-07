import { Injectable } from '@nestjs/common';
import { QuickResponseCategory } from '../entities/quick-response-category.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class QuickResponseCategoryService {
  @InjectModel(QuickResponseCategory)
  private readonly quickResponseCategoryRepository: typeof QuickResponseCategory;
  async GetCategories() {
    const data = await this.quickResponseCategoryRepository.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    return data;
  }
}
