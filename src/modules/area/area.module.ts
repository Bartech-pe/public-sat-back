import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Area } from './entities/area.entity';
import { AreaRepository } from './repositories/area.repository';

@Module({
  imports: [SequelizeModule.forFeature([Area])],
  controllers: [AreaController],
  providers: [AreaService, AreaRepository],
  exports: [AreaService, AreaRepository],
})
export class AreaModule {}
