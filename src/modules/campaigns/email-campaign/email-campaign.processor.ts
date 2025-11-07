// email.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CreateEmailCampaignDetailDto } from './dto/create-email-campaign-detail.dto';
import { EmailCampaignDetailService } from './services/email-campaign-detail.service';

@Processor('email-queue')
export class EmailCampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailCampaignProcessor.name);
  constructor(private readonly service: EmailCampaignDetailService) {
    super();
  }

  async process(
    job: Job<CreateEmailCampaignDetailDto, any, string>,
  ): Promise<any> {
    const email = job.data;
    try {
      // const response = await this.client.post('/correo', {
      //   codProceso: email.processCode,
      //   codRemitente: email.senderCode,
      //   correoDestino: email.to,
      //   correoConCopia: email.cc ?? null,
      //   correoConCopiaOculta: email.bcc ?? null,
      //   asunto: email.subject,
      //   mensaje: email.message,
      //   codTipDocumento: email.documentTypeCode ?? null,
      //   valTipDocumento: email.documentTypeValue ?? null,
      //   nomTerminal: email.terminalName,
      //   adjuntos: (email.attachments || []).map((a:any) => ({
      //     nombreArchivo: a.fileName,
      //     codTipoArchivo: a.fileTypeCode,
      //     orden: a.order,
      //     base64: a.base64,
      //   })),
      // });

      // if(response.status == 200 ){
      //  return this.service.create(email);
      // }

      return this.service.create(email);
    } catch (error) {
      this.logger.error(
        `Error al enviar correo a ${email.to} (Job ID: ${job.id}): ${
          error.response?.data?.message || error.message
        }`,
      );

      throw error;
    }
  }
}
