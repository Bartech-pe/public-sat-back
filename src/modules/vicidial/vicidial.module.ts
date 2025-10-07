import { Module } from '@nestjs/common';
import { VicidialApiModule } from './vicidial-api/vicidial-api.module';
import { CentralTelefonicaModule } from './central-telefonica/central-telefonica.module';
import { CallModule } from '@modules/call/call.module';
import { MonitorModule } from './monitor/monitor.module';

@Module({
  imports: [
    VicidialApiModule,
    CentralTelefonicaModule,
    CallModule,
    MonitorModule,
  ],
})
export class VicidialModule {}
