import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tags } from './entities/tag.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { TagsRepository } from './repositories/tags.repository';

@Module({
  imports: [SequelizeModule.forFeature([Tags])],
  controllers: [TagsController],
  providers: [TagsService,TagsRepository],
  exports: [TagsRepository],
})
export class TagsModule {}
