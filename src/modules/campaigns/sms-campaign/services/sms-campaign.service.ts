import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CampaignTypeRepository } from '@modules/campaign-type/repositories/campaign-type.repository';
import { SmsCampaignRepository } from '../repositories/sms-campaign.repository';
import { CreateSmsCampaignDto } from '../dto/create-sms-campaign.dto';
import * as XLSX from 'xlsx';
import { UpdateSmsCampaignDto } from '../dto/update-sms-campaign.dto';
import { formatDateTime, formatYearTime } from '@common/helpers/time.helper';
import { SmsCampaign } from '../entities/sms-campaign.entity';
import {
  SrvSmsMessage,
  SrvMessage,
} from '@modules/api-sat/srvmensajeria/dto/sms-message.dto';
import { SrvmensajeriaService } from '@modules/api-sat/srvmensajeria/srvmensajeria.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SmsCampaignDetail } from '../entities/sms-campaign-detail.entity';
import { SmsCampaignDetailRepository } from '../repositories/sms-campaign-detail.repository';

@Injectable()
export class SmsCampaignService {
  constructor(
    private readonly campaignTypeRepository: CampaignTypeRepository,
    private readonly smsCampaignRepository: SmsCampaignRepository,
    private readonly smsRepository: SmsCampaignDetailRepository,
    private readonly srvmensajeriaService: SrvmensajeriaService,
    @InjectQueue('sms-campaign')
    private readonly smsQueue: Queue,
  ) {}
  async findAll(limit: number, offset: number) {
    const data = await this.smsCampaignRepository.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'ASC']],
      attributes: [
         'id',
         'name',
         'total_registered',
         'campaign_status',
         'sender',
         'message',
         'createdAt',
      ],
      // include: [{ model: Campaign, attributes: ['name'] }],
    });
    const smsData = data.data.map((a) => {
      const json = a.toJSON();
      return {
        id: json.id,
        name: json.name,
        total_registered: json.total_registered,
        campaign_status: json.campaign_status,
        sender: json.sender,
        message: json.message,
        createdAt: formatYearTime(json.createdAt),
      };
    });
    const paginated = {
      data: smsData,
      limit: limit,
      offset: offset,
      total: smsData.length,
    };
    return paginated;
  }

  async findOne(id: number) {
    try {
      const exist = await this.smsCampaignRepository.findOne({
        where: { id: id },
        // include: [
        //   {
        //     model: Campaign,
        //     attributes: ['name', 'departmentId', 'campaignStateId'],
        //   },
        // ],
        attributes: [
          'id',
          'senderId',
          'contact',
          'message',
          'createdAt',
          'excelData',
        ],
      });
      if (!exist) {
        throw new NotFoundException('Campaña no encontrado');
      }

      const json = exist.toJSON();
      const allHeaders: string[] = Object.keys(json.excelData[0]);
      const showheaders = allHeaders.map((label, idx) => ({
        label,
        value: idx + 1,
      }));
      const smsDetail = {
        id: json.id,
        senderId: json.senderId,
        contact: json.contact,
        message: json.message,
        createdAt: formatDateTime(json.createdAt),
        name: json.campaign.name,
        campaignStateId: json.campaign.campaignStateId,
        departmentId: json.campaign.departmentId,
        excelData: json.excelData,
        showheaders: showheaders,
      };
      return smsDetail;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  async update(id: number, dto: UpdateSmsCampaignDto) {
    const exist = await this.smsCampaignRepository.findById(id);
    if (!exist) {
      throw new NotFoundException('Campaña no encontrado');
    }

    await this.smsCampaignRepository.update(id, dto);
    // const updateCampaign: Partial<Campaign> = {
    //   name: body.name,
    //   departmentId: body.departmentId,
    //   campaignStateId: body.campaignStateId,
    // };
    // await this.repository.update(exist.toJSON().campaign_id, updateCampaign);

    return this.findOne(id);
  }
  remove(id: number): Promise<void> {
    try {
      return this.smsCampaignRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  // async createSmsCampaign(dto: CreateSmsCampaignDto) {
  //   return await this.smsCampaignRepository.create(dto);
  // }

  async createSmsCampaign(
      dto: CreateSmsCampaignDto,
      file: Express.Multer.File,
      idUser: number
    ): Promise<SmsCampaign> {
      try {
        if (!file) {
          throw new BadRequestException('Debe subir un archivo Excel.');
        }
  
        // Leer el archivo Excel
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!data.length) {
          throw new BadRequestException('El archivo Excel está vacío.');
        }
  
        const result = await this.smsCampaignRepository.create({
          ...dto
        });
    
        this.smsQueue.add('sms-campaign', {
          idCampaign: result.toJSON().id,
          details: data,
          idUser:idUser
        });
  
        return result;
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
  }

  private renderTemplate(
    template: string,
    contacto: Record<string, any>,
  ): string {
    // Crear una versión en minúsculas del objeto para coincidencias más flexibles
    const normalizedContact = Object.keys(contacto).reduce(
      (acc, key) => {
        acc[key.toLowerCase()] = contacto[key];
        return acc;
      },
      {} as Record<string, any>,
    );

    return template.replace(/\[([^\]]+)\]/g, (_, variable) => {
      const key = variable.trim().toLowerCase(); // compara en minúsculas
      return normalizedContact[key] ?? '';
    });
  }

  readSMSExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });
    if (sheetData.length === 0) {
      return { headers: [], rows: [] };
    }
    const headers: string[] = sheetData[0].map((h: any) => String(h).trim());
    const rows: Record<string, any>[] = sheetData
      .slice(1)
      .filter((row) =>
        row.some((cell) => cell !== null && cell !== undefined && cell !== ''),
      )
      .map((row) => {
        const obj: Record<string, any> = {};
        headers.forEach((header, idx) => {
          obj[header] = row[idx] ?? null;
        });
        return obj;
      });
    const showheaders = headers.map((label, idx) => ({
      label,
      value: idx + 1,
    }));
    return { showheaders, rows };
  }
  async buildMessages(
    rows: Record<string, any>[],
    message: string,
    contact: string,
  ) {
    const rowMessages = this.getMessages(rows, message, contact);
    const newMessages = rowMessages.map((row) => {
      const msg: SrvMessage = {
        numTelDestino: row.contact.toString(),
        mensaje: this.renderTemplate(row.message, row),
        codTipDocumento: null,
        valTipDocumento: null,
      };
      return msg;
    });
    const body: SrvSmsMessage = {
      codProceso: 1,
      codRemitente: 1,
      nomTerminal: 'Terminal',
      mensajes: newMessages,
    };

    const responseMessage =
      await this.srvmensajeriaService.sendSmsMessage(body);
    return responseMessage;
  }

  getMessages(rows: Record<string, any>[], message: string, contact: string) {
    return rows.map((row) => {
      const processedMessage = this.processMessage(message, row);
      return {
        contact: row[contact] ?? '',
        message: this.renderTemplate(processedMessage, row),
      };
    });
  }

  processMessage(message: string, row: Record<string, any>) {
    let result = message;
    Object.entries(row).forEach(([key, value]) => {
      const placeholder = `##${key}##`;
      result = result.replaceAll(
        placeholder,
        value !== null && value !== undefined ? String(value) : '',
      );
    });
    return result;
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

          const formattedBatch = batch.map((item) => ({
            senderId: idUser.toString(),
            contact: item.numTelDestino,
            smsCampaignId: idCampaign,
            message: item.mensaje,
          }));

          await this.smsRepository.bulkCreate(formattedBatch, {
            updateOnDuplicate: ['message', 'contact'],
          });

          processed += formattedBatch.length;

        }
      
        const registros = await this.smsRepository.findAll({
          where: { smsCampaignId: idCampaign },
        });

        if (!registros.length) {
          console.log(`No se encontraron registros para la campaña #${idCampaign}`);
          return;
        }


        const mensajes = registros.map((row) => ({
          numTelDestino: row.contact,
          mensaje: row.message,
          codTipDocumento: null,
          valTipDocumento: null,
        }));

        const body = {
          codProceso: 1,
          codRemitente: 1,
          nomTerminal: 'Terminal',
          mensajes,
        };

         console.log(`Preparando envío de ${registros.length} mensajes al servicio externo...`);

      try {
        const response = await this.srvmensajeriaService.sendSmsMessage(body);

        if(response){
            for (const registro of registros) {
              await this.smsRepository.update(registro.id, { active: 'Y' });
            }
        }

      } catch (err) {
        console.error('Error al enviar mensajes al servicio externo:', err.message);
      }

      console.log(`Finalizado: ${processed}/${total} registros procesados y enviados`);
  }

  async viewMessageDetails(idCampaign: number) {
    try {

        if (!idCampaign || isNaN(idCampaign)) {
          throw new BadRequestException('El ID de campaña no es válido');
        }

      const messages = await this.smsRepository.findAll({
        where: { smsCampaignId: idCampaign },
          order: [['createdAt', 'DESC']],
        });

        if (!messages.length) {
          throw new NotFoundException(
            `No messages found for campaign ID ${idCampaign}`,
          );
        }


      const messagesSent = await this.smsRepository.findAll({
          where: { smsCampaignId: idCampaign , active: 'Y'},
            order: [['createdAt', 'DESC']],
      });
      const messagesNotSent = await this.smsRepository.findAll({
          where: { smsCampaignId: idCampaign, active: 'N' },
            order: [['createdAt', 'DESC']],
      });
    
      const totalMessages = messages.length;
      const sentCount = messagesSent.length;
      const notSentCount = messagesNotSent.length;

      const sentPercentage = totalMessages > 0 ? (sentCount / totalMessages) * 100 : 0;
      const notSentPercentage = totalMessages > 0 ? (notSentCount / totalMessages) * 100 : 0;

      return {
        totalMessages,
        sentCount,
        notSentCount,
        sentPercentage: sentPercentage.toFixed(2) + '%',
        notSentPercentage: notSentPercentage.toFixed(2) + '%',
        messages
      };
    } catch (error) {
      console.error(`Error al obtener detalles de la campaña ${idCampaign}:`, error.message);
      throw new InternalServerErrorException('Error al obtener los detalles de los mensajes');
    }
  }


}
