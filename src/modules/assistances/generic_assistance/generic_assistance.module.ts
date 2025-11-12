import { Module } from '@nestjs/common';
import { GenericAssistanceController } from './controllers/generic_assistance.controller';
import { GenericAssistanceService } from './services/generic_assistance.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenericAssistance } from './entities/generic-assistance.entity';
import { CitizenModule } from '@modules/citizen/citizen.module';
import { GenericAssistanceRepository } from './repositories/generic-assistance.repository';

@Module({
  imports: [SequelizeModule.forFeature([GenericAssistance]), CitizenModule],
  controllers: [GenericAssistanceController],
  providers: [GenericAssistanceService, GenericAssistanceRepository],
  exports: [GenericAssistanceService, GenericAssistanceRepository],
})
export class GenericAssistanceModule {}
