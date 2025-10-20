import { Module } from '@nestjs/common';
import { VicidialApiModule } from './vicidial-api/vicidial-api.module';
import { CentralTelefonicaModule } from './central-telefonica/central-telefonica.module';
import { CallModule } from '@modules/call/call.module';
import { MonitorModule } from './monitor/monitor.module';
import { VicidialCredentialsController } from './controllers/vicidial-credentials.controller';
import { VicidialCredentialService } from './services/vicidial-credentials.service';
import { InboxModule } from '@modules/inbox/inbox.module';
import { VicidialCredentialRepository } from './repositories/vicidial-credential.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { VicidialCredential } from './entities/vicidial-credentials.entity';

@Module({
  controllers: [VicidialCredentialsController],
  providers: [VicidialCredentialService, VicidialCredentialRepository],
  imports: [
    SequelizeModule.forFeature([VicidialCredential]),
    InboxModule,
    VicidialApiModule,
    CentralTelefonicaModule,
    CallModule,
    MonitorModule,
  ],
})
export class VicidialModule {}
