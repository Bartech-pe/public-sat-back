import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { GestionCampaniaRepository } from "./repositories/gestion-campania.repository";
import { TipoCampaniaRepository } from "@modules/tipo-campania/repositories/tipo-campania.repository";
import { SmsCampaingDetailRepository } from "./repositories/sms-campaing-detail.repository";
import { CreateSmsCampaing } from "./dto/sms-campaing/create-sms-campaing.dto";
import { Message, SmsMessageChannel } from "./dto/sms-message.dto";
import { SmsChannelService } from "./sms-channel.service";
import * as XLSX from 'xlsx';
import { Campaing } from "@modules/campaing/entities/campaing.entity";
import { GestionCampaniaResponse } from "./entities/gestion-campania.entity";
import { UpdateSmsCampaing } from "./dto/sms-campaing/update-sms-campaing.dto";
import { SmsCampaingDetail } from "./entities/sms-campaing-detail.entity.ts";
import { formatDateTime, formatYearTime } from "@common/helpers/time.helper";

@Injectable()
export class SmsCampaingService {
    constructor(
        private readonly repository: GestionCampaniaRepository,
        private readonly campaingTypeRepository:TipoCampaniaRepository,
        private readonly smsCampaingDetailRepository:SmsCampaingDetailRepository,
        private readonly smsChannelService:SmsChannelService
    ){}
    async findAll(limit:number,offset:number){
      const data = await this.smsCampaingDetailRepository.findAndCountAll({limit,offset, order: [['createdAt', 'ASC']],
        attributes:['id','senderId','contact','message','createdAt'],
        include: [
          { model: GestionCampaniaResponse,
            attributes:['nombre']
          }
        ]
       })
      const smsData = data.data.map(a => {
        const json = a.toJSON()
        return {
          id: json.id,
          senderId: json.senderId,
          contact: json.contact,
          message: json.message,
          createdAt: formatYearTime(json.createdAt),
          nombre: json.gestion_campania.nombre,
          id_estado_campania: json.gestion_campania.id_estado_campania,
          id_area_campania: json.gestion_campania.id_area_campania,
        }
      })
      const paginated = {
        data:smsData,
        limit:limit,
        offset:offset,
        total:smsData.length

      }
      return paginated;
    }
  async findOne(id: number) {
    try {
      const exist = await this.smsCampaingDetailRepository.findOne({where:{id:id},
        include: [
          { model: GestionCampaniaResponse,
            attributes:['nombre','id_area_campania','id_estado_campania']
          }
        ],
        attributes:['id','senderId','contact','message','createdAt','excelData'],

      });
      if (!exist) {
        throw new NotFoundException('Campaña no encontrado');
      }
      
      const json= exist.toJSON()
      const allHeaders: string[] = Object.keys(json.excelData[0]);
      const showheaders = allHeaders.map((label, idx) => ({
      label,
      value: idx + 1,
    }));
      const smsDetail={
        id: json.id,
        senderId: json.senderId,
        contact: json.contact,
        message: json.message,
        createdAt: formatDateTime(json.createdAt),
        nombre: json.gestion_campania.nombre,
        id_estado_campania: json.gestion_campania.id_estado_campania,
        id_area_campania: json.gestion_campania.id_area_campania,
        excelData: json.excelData,
        showheaders: showheaders
      }
      return smsDetail;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  async update(id: number, body: UpdateSmsCampaing) {
      const exist = await this.smsCampaingDetailRepository.findById(id);
      if (!exist) {
        throw new NotFoundException('Campaña no encontrado');
      }
      const updateSms:Partial<SmsCampaingDetail>={
         senderId: body.senderId,
         contact: body.contact,
         countryCode: body.countryCode,
         message: body.message,
      }
      if(body.rows){
        const result = body.rows.map(inner => ({ ...inner }));
        updateSms.excelData = result
      }
      await this.smsCampaingDetailRepository.update(id,updateSms);
      const updateCampaing:Partial<GestionCampaniaResponse>={
         nombre:body.nombre,
         id_area_campania:body.id_area_campania,
         id_estado_campania:body.id_estado_campania
      }
      await this.repository.update(exist.toJSON().gestion_campania_id,updateCampaing);

      return this.findOne(id);
   
  }
  remove(id: number): Promise<void> {
         try {
           return this.smsCampaingDetailRepository.delete(id);
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }
    async createSmsCampaing(body: CreateSmsCampaing) {
        const type = await this.campaingTypeRepository.getSMS();
        if (!type) throw new NotFoundException('tipo sms no encontrado')
        const campaing = await this.repository.create({
            nombre: body.nombre,
            id_tipo_campania: type.toJSON().id,
            id_area_campania:body.id_area_campania,
            id_estado_campania:body.id_estado_campania,
            createUser: body.createUser
        })
        const result = body.rows.map(inner => ({ ...inner }));
        const createsms = {
            senderId: body.senderId,
            contact: body.contact,
            message: body.message,
            countryCode: body.countryCode,
            gestion_campania_id: campaing.toJSON().id,
            excelData: result,
        }
        const sms = await this.smsCampaingDetailRepository.create(createsms)
        const response = await this.buildMessages(result,body.message,body.contact)
        return response;
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
    const rows: Record<string, any>[] = sheetData.slice(1)
      .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ''))
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
  async buildMessages(rows: Record<string, any>[], message: string, contact: string){
        const rowMessages = this.getMessages(rows,message,contact)
        const newMessages = rowMessages.map(row=>{
           const msg: Message = {
             numTelDestino: row.contact.toString(),
             mensaje: row.message,
             codTipDocumento: null,
             valTipDocumento: null
           }
           return msg
        })
        const body:SmsMessageChannel={
          codProceso: 1,
          codRemitente: 1,
          nomTerminal: "Terminal",
          mensajes: newMessages
        }
       const responseMessage = await this.apiSat(body)
       return responseMessage;
  }

  getMessages(rows: Record<string, any>[], message: string, contact: string) {
        return rows.map((row) => {
            const processedMessage = this.processMessage(message, row);
            return {
                contact: row[contact] ?? '', 
                message: processedMessage,
            };
        });
  }
  processMessage(message: string, row: Record<string, any>,) {
    let result = message;
    Object.entries(row).forEach(([key, value]) => {
      const placeholder = `##${key}##`;
      result = result.replaceAll(placeholder, value !== null && value !== undefined ? String(value) : '');
    });
    return result
  }
    async apiSat(body: SmsMessageChannel) {
        return await this.smsChannelService.sendMessages(body);
    }
}
