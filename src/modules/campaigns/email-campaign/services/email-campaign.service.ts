import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EmailCampaignRepository } from '../repositories/email-campaign.repository';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { CreateEmailCampaignDto } from '../dto/create-email-campaign.dto';
import { UpdateEmailCampaignDto } from '../dto/update-email-campaign.dto';
import { EmailTemplate } from '@modules/campaigns/email-template/entities/email-template.entity';
import * as XLSX from 'xlsx';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailCampaignDetailRepository } from '../repositories/email-campaign-detail.repository';
import { EmailCampaignAttachmentRepository } from '../repositories/email-campaign-attachment.repository';
import { SrvmensajeriaService } from '@modules/api-sat/srvmensajeria/srvmensajeria.service';
import { col, fn, Op, Order, where } from 'sequelize';
@Injectable()
export class EmailCampaignService {
  constructor(
       private readonly repository: EmailCampaignRepository,
       private readonly repositoryDetalle: EmailCampaignDetailRepository,
       private readonly repositoryAttachment: EmailCampaignAttachmentRepository,
       private readonly srvmensajeriaService: SrvmensajeriaService,
      @InjectQueue('email-queue-campaign')
      private readonly smsQueue: Queue,
  ) {}

  async findAll(
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<EmailCampaign>> {
    try {

      const { orderField, searchText = '' } = q || {};
      const searchTerm = searchText.toLowerCase();
      const whereOptions: any = {};
      if (searchTerm) {
        const safeTerm = searchTerm.replace(/'/g, "''"); // prevenir inyección SQL
        whereOptions[Op.or] = [
          where(fn('LOWER', col('EmailCampaign.name')), {
            [Op.like]: `%${safeTerm}%`,
          }),
        ];
      }
      const order: Order = orderField
        ? [[orderField.field, orderField.order]]
        : [['id', 'DESC']];

      return this.repository.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
        order,
        include: [
          {
            model: EmailTemplate,
            as: 'template',
            attributes: ['id', 'name', 'template'],
          },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findOne(id: number): Promise<EmailCampaign> {
    try {
      const exist = await this.repository.findById(id);
      if (!exist) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  // async create(dto: CreateEmailCampaignDto): Promise<EmailCampaign> {
  //   try {
  //     return this.repository.create(dto);
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       error,
  //       'Error interno del servidor',
  //     );
  //   }
  // }

  async create(
        dto: CreateEmailCampaignDto,
        file: Express.Multer.File,
        idUser: number
      ): Promise<EmailCampaign> {
        try {
          if (!file) {
            throw new BadRequestException('Debe subir un archivo Excel.');
          }
          // console.log(dto.attachments)
          // // Leer el archivo Excel
          const workbook = XLSX.read(file.buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
          if (!data.length) {
            throw new BadRequestException('El archivo Excel está vacío.');
          }
    
          const result = await this.repository.create({
            ...dto
          });

          //console.log(data)
         
          this.smsQueue.add('email-queue-campaign', {
            idCampaign: result.toJSON().id,
            details: data,
            idUser:idUser
          });

          let attachments: any[] = [];
          if (dto.attachments) {
            try {
           
              if (typeof dto.attachments === 'string') {
                attachments = JSON.parse(dto.attachments);
              } else if (Array.isArray(dto.attachments)) {
                attachments = dto.attachments;
              }

            
              attachments = attachments.filter(
                (a) => a && (a.fileName?.trim() || a.base64?.trim())
              );

           
              if (attachments.length > 0) {
                await this.repositoryAttachment.bulkCreate(
                  attachments.map((item) => ({
                    ...item,
                    emailCampaignId: result.toJSON().id,
                  }))
                );
              }
            } catch (error) {
              console.warn('⚠️ Error al parsear attachments:', error);
            }
          }

    
          return result;
        } catch (error) {
          throw new InternalServerErrorException(
            error,
            'Error interno del servidor',
          );
        }
  }

  async bulkCreate(
    dtoList: CreateEmailCampaignDto[],
  ): Promise<EmailCampaign[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => ({
          ...dto,
        })),
      );
      return this.repository.bulkCreate(securedDtoList, {});
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async update(
    id: number,
    dto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async toggleStatus(id: number): Promise<EmailCampaign> {
    try {
      const exist = await this.repository.findById(id);

      const status = !exist.get().status;

      exist.update({ status });

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  remove(id: number): Promise<void> {
    try {
      return this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async saveSMSCampaignDetails(
      idCampaign: number,
      details: any[],
      idUser: number,
  ): Promise<void> {
      const BATCH_SIZE = 500;
      const total = details.length;
      let processed = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = details.slice(i, i + BATCH_SIZE);

        // const formattedBatch = batch.map((item) => ({
        //   senderId: idUser.toString(),
        //   contact: item.numTelDestino,
        //   smsCampaignId: idCampaign,
        //   message: item.mensaje,
        // }));

        const detallesConCampania = details.map((detalle) => ({
          ...detalle,
          emailCampaignId: idCampaign,
        }));

        await this.repositoryDetalle.bulkCreate(detallesConCampania);

        processed += details.length;

      }
      
      console.log("Iniciando envío de campaña de correos...");

      const listDetail = await this.repositoryDetalle.findAll({
        where: { emailCampaignId: idCampaign },
      });

      const listDetailAttachment = await this.repositoryAttachment.findAll({
        where: { emailCampaignId: idCampaign },
      });

      if (!listDetail.length) {
        console.log(`No se encontraron registros para la campaña #${idCampaign}`);
        return;
      }

      try {
        // Envío secuencial uno por uno
        for (const email of listDetail) {
          const attachments = (listDetailAttachment || []).map((a: any) => ({
            nombreArchivo: a.fileName,
            codTipoArchivo: a.fileTypeCode,
            orden: a.order,
            base64: a.base64,
          }));

          const request = {
            codProceso: email.processCode,
            codRemitente: email.senderCode,
            correoDestino: email.to,
            correoConCopia: email.cc ?? null,
            correoConCopiaOculta: email.bcc ?? null,
            asunto: email.subject,
            mensaje: email.message,
            codTipDocumento: email.documentTypeCode ?? null,
            valTipDocumento: email.documentTypeValue ?? null,
            nomTerminal: email.terminalName,
            adjuntos: attachments,
          };

          console.log(`Enviando correo a: ${email.to}...`);

          const response = await this.srvmensajeriaService.sendMailMessage(request);

          if (response) {
            // ✅ Marca como enviado
             await this.repositoryDetalle.update(email.id, { active: 'Y' });
            console.log(`Correo enviado a ${email.to} correctamente.`);
          } else {
            console.warn(`No se pudo enviar el correo a ${email.to}.`);
          }

          // (Opcional) retraso entre correos, por ejemplo 1 segundo
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        console.log("✅ Envío de correos completado.");
      } catch (err) {
        console.error('❌ Error al enviar mensajes al servicio externo:', err.message);
      }



  }
}
