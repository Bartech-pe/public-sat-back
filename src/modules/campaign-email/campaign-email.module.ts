import { Module } from '@nestjs/common';
import { CampaignEmailService } from './campaign-email.service';
import { CampaignEmailController } from './campaign-email.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CampaignEmail } from './entities/campaign-email.entity';
import { BullModule } from '@nestjs/bullmq';
import { CampaignEmailRepository } from './repositories/campaign-email.repository';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [SequelizeModule.forFeature([CampaignEmail]),
  BullModule.registerQueue({
      name: 'email-queue', 
  }),
 ],
  controllers: [CampaignEmailController],
  providers: [CampaignEmailService,EmailProcessor,CampaignEmailRepository],
  exports: [CampaignEmailRepository,EmailProcessor],
})
export class CampaignEmailModule {}
