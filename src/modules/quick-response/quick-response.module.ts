import { Module } from '@nestjs/common';
import { QuickResponseCategoryController } from './controller/quick-response-category.controller';
import { QuickResponseController } from './controller/quick-esponse.controller';
import { QuickResponseService } from './services/quickResponse.service';
import { QuickResponseCategoryService } from './services/quickResponseCategory.service';
import { QuickResponse } from './entities/quick-response.entity';
import { QuickResponseCategory } from './entities/quick-response-category.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([QuickResponse, QuickResponseCategory])],
  controllers: [QuickResponseCategoryController, QuickResponseController],
  providers: [QuickResponseService, QuickResponseCategoryService],
  exports: [],
})
export class QuickResponseModule {}
