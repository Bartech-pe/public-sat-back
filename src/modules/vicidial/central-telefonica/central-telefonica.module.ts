import { forwardRef, Module } from '@nestjs/common';
import { CentralTelefonicaController } from './controllers/central-telefonica.controller';
import { VicidialUserService } from './services/vicidial-user.service';
import { VicidialUser } from './entities/vicidial-user.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { VicidialCampaign } from './entities/vicidial-campaign.entity';
import { AudioController } from './audio.controller';
import { AudioService } from './services/audio.service';
import { AudioStoreDetails } from './entities/audio-store-details.entity';
import { VicidialLead } from './entities/vicidial-list.entity';
import { VicidialLists } from './entities/vicidial-lists.entity';
import { AloSatController } from './controllers/alo-sat.controller';
import { AloSatService } from './services/alo-sat.service';
import { UserModule } from '@modules/user/user.module';
import { VicidialCallTimes } from './entities/vicidial-call-times.entity';
import { VicidialCallTimesHolidays } from './entities/vicidial-call-times-holidays.entity';
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
import { CampaignModule } from '@modules/campaign/campaign.module';

@Module({
  imports: [
    SequelizeModule.forFeature(
      [
        VicidialUser,
        VicidialCampaign,
        AudioStoreDetails,
        VicidialLists,
        VicidialLead,
        VicidialCallTimes,
        VicidialCallTimesHolidays,
      ],
      'central',
    ),
    HttpModule,
    CampaignModule,
    UserModule,
    VicidialApiModule,
    forwardRef(() => CallModule),
    forwardRef(() => AmiModule),
    BullModule.registerQueue({
      name: 'register-details-audio', 
    }),
  ],
  controllers: [
    CentralTelefonicaController,
    AudioController,
    AloSatController,
    VicidialCallTimeController,
    VicidialCallTimeHolidayController,
  ],
  providers: [
    VicidialUserService,
    AudioService,
    AloSatService,
    VicidialCallTimesHolidaysService,
    VicidialCallTimesService,
    VicidialCampaingRepository,
    AudioQueueProcessor
  ],
  exports: [AloSatService, VicidialCampaingRepository,AudioQueueProcessor],
})
export class CentralTelefonicaModule {}
