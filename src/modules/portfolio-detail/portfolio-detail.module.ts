import { Module } from '@nestjs/common';
import { PortfolioDetailService } from './portfolio-detail.service';
import { PortfolioDetailController } from './portfolio-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PortfolioDetail } from './entities/portfolio-detail.entity';
import { PortfolioDetailRepository } from './repositories/portfolio-detail.repository';
import { CaseInformation } from '@modules/portfolio-detail/entities/case-information.entity';
import { CaseInformationRepository } from './repositories/case-information.repository';
import { PortfolioAssignment } from './entities/portfolio-assignment.entity';
import { PortfolioAssignmentRepository } from './repositories/portfolio-assignment.repository';
import { CitizenContact } from '../citizen/entities/citizen-contact.entity';
import { CitizenModule } from '@modules/citizen/citizen.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PortfolioDetail,
      CaseInformation,
      PortfolioAssignment,
    ]),
    CitizenModule,
  ],
  controllers: [PortfolioDetailController],
  providers: [
    PortfolioDetailService,
    PortfolioDetailRepository,
    CaseInformationRepository,
    PortfolioAssignmentRepository,
  ],
  exports: [
    PortfolioDetailRepository,
    CaseInformationRepository,
    PortfolioAssignmentRepository,
  ],
})
export class PortfolioDetailModule {}
