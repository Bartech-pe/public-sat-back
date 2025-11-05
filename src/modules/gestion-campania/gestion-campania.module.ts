import { Module } from '@nestjs/common';
import { GestionCampaniaService } from './gestion-campania.service';
import { GestionCampaniaController } from './gestion-campania.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { GestionCampaniaResponse } from './entities/gestion-campania.entity';
import { GestionCampaniaRepository } from './repositories/gestion-campania.repository';
import { FeriadoModule } from '@modules/horario/feriado.module';
import { TipoCampaniaModule } from '@modules/tipo-campania/tipo-campania.module';
import { SmsChannelService } from './sms-channel.service';
import { SmsCampaingDetail } from './entities/sms-campaing-detail.entity.ts';
import { SmsCampaingDetailRepository } from './repositories/sms-campaing-detail.repository';
import { SmsCampaingService } from './sms-campaing.service';
import { SmsCampaingController } from './sms-campaing.controller';

@Module({
  imports: [SequelizeModule.forFeature([GestionCampaniaResponse,SmsCampaingDetail]),FeriadoModule,TipoCampaniaModule],
  controllers: [GestionCampaniaController,SmsCampaingController],
  providers: [GestionCampaniaService,GestionCampaniaRepository,SmsCampaingDetailRepository,SmsChannelService,SmsCampaingService],
  exports: [GestionCampaniaRepository],
})
export class GestionCampaniaModule {}
