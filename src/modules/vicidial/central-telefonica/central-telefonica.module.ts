import { forwardRef, Module } from '@nestjs/common';
import { CentralTelefonicaController } from './controllers/central-telefonica.controller';
import { VicidialUserService } from './services/vicidial-user.service';
import { AudioController } from './controllers/audio-store.controller';
import { AudioStoreService } from './services/audio-store.service';
import { AloSatController } from './controllers/alo-sat.controller';
import { AloSatService } from './services/alo-sat.service';
import { UserModule } from '@modules/user/user.module';
import { VicidialCallTimeController } from './controllers/vicidial-call-time.controller';
import { VicidialCallTimesHolidaysService } from './services/vicidial-call-times-holidays.service';
import { VicidialCallTimesService } from './services/vicidial-call-times.service';
import { VicidialCallTimeHolidayController } from './controllers/vicidial-call-time-holiday.controller';
import { VicidialApiModule } from '../vicidial-api/vicidial-api.module';
import { VicidialCampaingRepository } from './repositories/vicidial-campaing.repository';
import { CallModule } from '@modules/call/call.module';
import { AmiModule } from '../ami/ami.module';
import { BullModule } from '@nestjs/bullmq';
import { AudioQueueProcessor } from './audioQueueProcessor';
import { HttpModule } from '@nestjs/axios';
import { ChannelAssistanceModule } from '@modules/assistances/channel-assistance/channel-assistance.module';
import { DatabaseCentralModule } from '@database/central/database-central.module';
import { VicidialUserRepository } from './repositories/vicidial-user.repository';
import { AudioStoreDetailsRepository } from './repositories/audio-store-details.repository';
import { VicidialListsRepository } from './repositories/vicidial-lists.repository';
import { VicidialLeadRepository } from './repositories/vicidial-lead.repository';
import { VicidialCallTimesHolidaysRepository } from './repositories/vicidial-call-times-holidays.repository';
import { VicidialCallTimesRepository } from './repositories/vicidial-call-times.repository';
import { AudioCampaignModule } from '@modules/campaigns/audio-campaign/audio-campaign.module';
import { CampaignScheduleModule } from '@modules/campaigns/campaign-schedule/campaign-schedule.module';
import { ScheduleModule } from '@modules/schedule/schedule.module';
import { AloSatGateway } from './alo-sat.gateway';

@Module({
  imports: [
    HttpModule,
    AudioCampaignModule,
    UserModule,
    VicidialApiModule,
    forwardRef(() => CallModule),
    forwardRef(() => AmiModule),
    BullModule.registerQueue({
      name: 'register-details-audio',
    }),
    forwardRef(() => ChannelAssistanceModule),
    DatabaseCentralModule,
    CampaignScheduleModule,
    ScheduleModule,
  ],
  controllers: [
    CentralTelefonicaController,
    AudioController,
    AloSatController,
    VicidialCallTimeController,
    VicidialCallTimeHolidayController,
  ],
  providers: [
    AudioQueueProcessor,
    VicidialUserService,
    AudioStoreService,
    AloSatService,
    VicidialCallTimesHolidaysService,
    VicidialCallTimesService,
    VicidialCampaingRepository,
    VicidialUserRepository,
    AudioStoreDetailsRepository,
    VicidialListsRepository,
    VicidialLeadRepository,
    VicidialCallTimesRepository,
    VicidialCallTimesHolidaysRepository,
    AloSatGateway,
  ],
  exports: [AloSatService, VicidialCampaingRepository, AudioQueueProcessor],
})
export class CentralTelefonicaModule {}
