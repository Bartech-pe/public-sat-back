import { Module } from '@nestjs/common';
import { ConsultTypeService } from './consult-type.service';
import { ConsultTypeController } from './consult-type.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConsultType } from './entities/consult-type.entity';
import { ConsultTypeRepository } from './repositories/consult-type.repository';

@Module({
  imports: [SequelizeModule.forFeature([ConsultType])],
  controllers: [ConsultTypeController],
  providers: [ConsultTypeService, ConsultTypeRepository],
  exports: [ConsultTypeRepository],
})
export class ConsultTypeModule {}
