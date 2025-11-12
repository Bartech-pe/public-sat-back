import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CitizenAssistanceController } from './citizen-assistance.controller';
import { CitizenAssistanceService } from './citizen-assistance.service';
import { CitizenAssistance } from './entities/citizen-assistance.entity';
import { CitizenAssistanceRepository } from './repositories/citizen-assistance.repository';
import { PortfolioDetailModule } from '@modules/portfolio-detail/portfolio-detail.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CitizenAssistance]),
    PortfolioDetailModule,
  ],
  controllers: [CitizenAssistanceController],
  providers: [CitizenAssistanceService, CitizenAssistanceRepository],
  exports: [CitizenAssistanceService, CitizenAssistanceRepository],
})
export class CitizenAssistanceModule {}
