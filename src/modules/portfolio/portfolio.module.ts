import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { PortfolioDetailModule } from '@modules/portfolio-detail/portfolio-detail.module';
import { CitizenModule } from '@modules/citizen/citizen.module';
import { UserModule } from '@modules/user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { PortfolioQueueProcessor } from './portfolio-queue.processor';
import { PortfolioGateway } from './portfolio.gateway';

@Module({
  imports: [
    SequelizeModule.forFeature([Portfolio]),
    PortfolioDetailModule,
    CitizenModule,
    UserModule,
    BullModule.registerQueue({
      name: 'portfolio-detail-queue',
    }),
  ],
  controllers: [PortfolioController],
  providers: [
    PortfolioService,
    PortfolioRepository,
    PortfolioQueueProcessor,
    PortfolioGateway,
  ],
  exports: [PortfolioRepository, PortfolioQueueProcessor],
})
export class PortfolioModule {}
