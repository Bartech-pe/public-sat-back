import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { Tag } from './entities/tag.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { TagRepository } from './repositories/tag.repository';

@Module({
  imports: [SequelizeModule.forFeature([Tag])],
  controllers: [TagController],
  providers: [TagService,TagRepository],
  exports: [TagRepository],
})
export class TagModule {}
