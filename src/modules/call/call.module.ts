import { HttpModule, HttpService } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { CallController } from './call.controller';
import { SatProxy } from '@common/proxy/sat/sat.proxy';
import { SMSProxy } from '@common/proxy/sms/sms.proxy';
import { RasaProxy } from '@common/proxy/rasa/rasa.proxy';
import { RasaService } from './rasa.service';
import { AmiService } from './services/ami.service';
import { CallService } from './services/call.service';
import { SMSService } from './services/sms.service';
import { SatService } from './services/sat.service';
import { CallStateRepository } from './repositories/callState.repository';
import { CallRepository } from './repositories/call.repository';
import { CallStateService } from './services/callState.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Call } from './entities/call.entity';
import { CallState } from './entities/callState.entity';
import { CallStateController } from './callState.controller';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { UserModule } from '@modules/user/user.module';
import { AMIGateway } from './ami.gateway';
import { DatabaseCentralModule } from '@database/central/database-central.module';
import { CentralTelefonicaModule } from '@modules/central-telefonica/central-telefonica.module';
import { AloSatService } from '@modules/central-telefonica/services/alo-sat.service';
import { SatController } from './sat.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Call, CallState]),
    UserModule,
    HttpModule,
    DatabaseCentralModule,
    forwardRef(() => CentralTelefonicaModule),
  ],
  controllers: [CallController, CallStateController, SatController],
  providers: [
    AmiService,
    CallService,
    SatService,
    SatProxy,
    SMSProxy,
    SMSService,
    RasaProxy,
    RasaService,
    CallStateRepository,
    CallRepository,
    CallStateService,
    AMIGateway,
  ],
  exports: [RasaService, RasaProxy, AmiService, SatService],
})
export class CallModule {}
