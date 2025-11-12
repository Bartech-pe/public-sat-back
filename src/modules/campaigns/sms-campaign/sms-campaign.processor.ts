import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SmsCampaignService } from './services/sms-campaign.service';
import { Logger } from '@nestjs/common';

@Processor('sms-campaign')
export class SmsCampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsCampaignProcessor.name);

  constructor(private readonly smsService: SmsCampaignService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const { idCampaign, details,idUser } = job.data;

    this.logger.log(`📩 Procesando campaña SMS (list_id: ${idCampaign}) con ${details?.length ?? 0} registros`);

    try {
      await this.smsService.saveSMSCampaignDetails(idCampaign, details,idUser);

      this.logger.log(`✅ Campaña ${idCampaign} procesada correctamente (${details?.length ?? 0} registros)`);
    } catch (error) {
      this.logger.error(`❌ Error al procesar campaña ${idCampaign}:`, error);
      throw error; // 👈 importante, para que BullMQ marque el job como fallido
    }
  }
}
