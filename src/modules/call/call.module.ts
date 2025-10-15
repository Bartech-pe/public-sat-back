import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { CallController } from './call.controller';
import { RasaProxy } from '@common/proxy/rasa/rasa.proxy';
import { RasaService } from './rasa.service';
import { CallService } from './services/call.service';
import { CallStateRepository } from './repositories/call-state.repository';
import { CallRepository } from './repositories/call.repository';
import { CallStateService } from './services/call-state.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Call } from './entities/call.entity';
import { CallState } from './entities/call-state.entity';
import { CallStateController } from './call-state.controller';
import { UserModule } from '@modules/user/user.module';
import { AmiModule } from '@modules/vicidial/ami/ami.module';
import { CentralTelefonicaModule } from '@modules/vicidial/central-telefonica/central-telefonica.module';
import { SaldomaticoModule } from '@modules/api-sat/saldomatico/saldomatico.module';
import { CallHistory } from './entities/call-history.entity';
import { CallHistoryRepository } from './repositories/call-history.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([Call, CallState, CallHistory]),
    UserModule,
    HttpModule,
    forwardRef(() => CentralTelefonicaModule),
    forwardRef(() => AmiModule),
    SaldomaticoModule,
  ],
  controllers: [CallController, CallStateController],
  providers: [
    CallService,
    RasaProxy,
    RasaService,
    CallStateRepository,
    CallRepository,
    CallStateService,
    CallHistoryRepository,
  ],
  exports: [RasaService, RasaProxy, CallService, CallHistoryRepository],
})
export class CallModule {}
