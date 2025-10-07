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
import { CitizenContactRepository } from './repositories/citizen-contact.repository';
import { CitizenContact } from './entities/citizen-contact.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PortfolioDetail,
      CaseInformation,
      PortfolioAssignment,
      CitizenContact,
    ]),
  ],
  controllers: [PortfolioDetailController],
  providers: [
    PortfolioDetailService,
    PortfolioDetailRepository,
    CaseInformationRepository,
    PortfolioAssignmentRepository,
    CitizenContactRepository,
  ],
  exports: [
    PortfolioDetailRepository,
    CaseInformationRepository,
    PortfolioAssignmentRepository,
    CitizenContactRepository,
  ],
})
export class PortfolioDetailModule {}
