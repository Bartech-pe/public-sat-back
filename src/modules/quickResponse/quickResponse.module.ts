import { Module } from '@nestjs/common';
import { QuickResponseCategoryController } from './controller/QuickResponseCategory.controller';
import { QuickResponseController } from './controller/QuickResponse.controller';
import { QuickResponseService } from './services/quickResponse.service';
import { QuickResponseCategoryService } from './services/quickResponseCategory.service';
import { QuickResponse } from './entities/quickResponse.entity';
import { QuickResponseCategory } from './entities/quickResponseCategory.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([QuickResponse, QuickResponseCategory])],
  controllers: [QuickResponseCategoryController, QuickResponseController],
  providers: [QuickResponseService, QuickResponseCategoryService],
  exports: [],
})
export class QuickResponseModule {}
