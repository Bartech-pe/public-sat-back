// audio.service.ts
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException,Logger } from '@nestjs/common';
import * as path from 'path';
import * as Client from 'ssh2-sftp-client';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs/promises';
import * as fs_unico from 'fs'; 
import { InjectModel } from '@nestjs/sequelize';
import { AudioStoreDetails } from '../entities/audio-store-details.entity';
import { VicidialLists } from '../entities/vicidial-lists.entity';
import { CreateVicidialListDto } from '../dto/create-vicidial-lists.dto';
import { VicidialLead } from '../entities/vicidial-list.entity';
import * as XLSX from 'xlsx';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { ConfigService } from '@nestjs/config';
import { vicidialConfig } from 'config/env';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import * as FormData from 'form-data';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


const writeFileAsync = promisify(fs_unico.writeFile);
const unlinkAsync = promisify(fs_unico.unlink);

@Injectable()
export class AudioService {

  private remotePath = '/var/lib/asterisk/sounds';
  private readonly logger = new Logger(AudioService.name);
 
  private readonly uploadUrl = vicidialConfig.host + '/vicidial/audio_store.php';
  private readonly uploadUrlAgente = vicidialConfig.host + '/vicidial/admin.php';
  private readonly username = vicidialConfig.user;
  private readonly password = vicidialConfig.pass;

  constructor(
      @InjectModel(AudioStoreDetails, 'central')
      private readonly audioRepo: typeof AudioStoreDetails,
      @InjectModel(VicidialLists, 'central')
      private readonly modelList: typeof VicidialLists,

      @InjectModel(VicidialLead, 'central')
      private readonly modelLead: typeof VicidialLead,
      
      @InjectQueue('register-details-audio')
      private readonly audioQueue: Queue,

      //private readonly gateway: PortfolioGateway,
      private readonly httpService: HttpService,
      private readonly configService: ConfigService
  ) {}

  findAllList(): Promise<VicidialLists[]> {
      return this.modelList.findAll();
  }

  findAllAudiosList(): Promise<AudioStoreDetails[]> {
      return this.audioRepo.findAll();
  }

  findAllListByCampaign(campaignId: string): Promise<VicidialLists[]> {
    return  this.modelList.findAll({
      where: { campaign_id: campaignId },
    });  
  }

  async createlistas(body: CreateVicidialListDto): Promise<{ status: 'created' | 'exists'; data: VicidialLists;}>{
        const { list_id, campaign_id, list_name, list_description, active  } = body;
  
        const existing = await this.modelList.findOne({ where: { list_id } });
  
        if (existing) {
          return {
            status: 'exists',
            data: existing,
          };
        }
  
        const createdList  = await this.modelList.create({
          list_id,
          campaign_id,
          list_name,
          list_description,
          active
        });


        return {
          status: 'created',
          data: createdList
        };
  }

  async createlistar(dto: Omit<CreateVicidialListDto, 'file'>, file: Express.Multer.File): Promise<VicidialLists> {
      try {
  
        if (!file) {
            throw new BadRequestException('Debe subir un archivo Excel.');
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!data.length) {
          throw new BadRequestException('El archivo Excel está vacío.');
        }

        const existingList = await this.modelList.findOne({
            where: { list_id: dto.list_id },
        });

        if (existingList) {
            throw new ConflictException(
              `El list_id ${dto.list_id} ya está registrado.`,
            );
        }
       
        const result = await this.modelList.create({ ...dto });

        const validLeads = data.map((row: any, index: number) => {
            const telefono = row.TELEFONO?.toString().trim();
            const obligado = row.OBLIGADO?.toString().trim();

            if (!telefono || !obligado) return null;

            return {
              first_name: obligado,
              last_name: row.PLACA?.toString().trim() || '',
              phone_number: telefono,
              status: 'NEW',
            };
        })

        const list = result.get({ plain: true });
        await this.audioQueue.add('register-details-audio', {
            list_id: list.list_id,  
            detalles: validLeads,
        });
  
          return result;

      } catch (error) {
            throw new InternalServerErrorException(
              error,
              'Error interno del servidor',
            );
      }

  }

  async savePortfolioDetails(list_id: number, detallesComplete: VicidialLead[]) {
    const BATCH_SIZE = 500;
    const total = detallesComplete.length;
    let processed = 0;

    console.log(`🚀 Iniciando carga de ${total} leads en lotes de ${BATCH_SIZE}...`);

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = detallesComplete.slice(i, i + BATCH_SIZE);

        const leadsToCreate = batch.map(lead => ({
          ...lead,
          list_id,
        }));

        await this.modelLead.bulkCreate(leadsToCreate);

        processed += batch.length;
        const percentage = Math.round((processed / total) * 100);

      }

      //this.gateway.sendComplete(total);
  }


  async processAndUpload(file: Express.Multer.File): Promise<any> {
    // Validar que sea un archivo de audio
    if (!file.mimetype.startsWith('audio/')) {
      throw new Error('El archivo debe ser de audio');
    }

  
    const tempFileName =   file.originalname;
    const tempPath = path.join(__dirname, '..', '..', 'temp', tempFileName);

    try {
      // Crear carpetas si no existen
      await this.ensureDirExists(path.dirname(tempPath));

      await writeFileAsync(tempPath, file.buffer);

      const uploadResponse = await this.uploadToVicidial(tempPath);
      
      
      return uploadResponse; // Retorna la respuesta de la API (ajusta según lo que necesites)

    } catch (error) {
      this.logger.error(`Error en processAndUpload: ${error.message}`);
      throw error;
    } finally {
      // Limpiar archivos temporales
      if (fs_unico.existsSync(tempPath)) {
        await unlinkAsync(tempPath);
      }
    }
  }

  private async uploadToVicidial(filePath: string): Promise<any> {
    const form = new FormData();
    form.append('action', 'MANUALUPLOAD');
    form.append('DB', '0');
    form.append('force_allow', '');
    form.append('audiofile', fs_unico.createReadStream(filePath));
    form.append('submit', 'submit');

    const authString = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const basicAuthHeader = `Basic ${authString}`;

    const config = {
      method: 'post',
      url: this.uploadUrl,
      maxBodyLength: Infinity,
      headers: {
        'Authorization': basicAuthHeader,
        ...form.getHeaders(),
      },
      data: form,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request(config)
      );
      
      return {
        status: 200,
        message: 'El archivo fue registrado correctamente en Vicidial.',
      };
      
    } catch (error) {
      this.logger.error(`Error en upload a Vicidial: ${error.message}`);
      throw new Error(`Error en upload: ${error.message}`);
    }
  }

  private async ensureDirExists(dirPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs_unico.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async updateAgente(body: any): Promise<any> {
    const form = new FormData();
    form.append('ADD', 41111); // Acción para agregar agente remoto
    form.append('DB', body.DB || '0'); // Ejemplo: DB=0
    form.append('remote_agent_id', body.remote_agent_id || '1');
    form.append('user_start', body.user_start || '400');
    form.append('number_of_lines', body.number_of_lines || '1');
    form.append('server_ip', body.server_ip || '10.0.12.1');
    form.append('conf_exten', body.conf_exten || '8366');
    form.append('extension_group', body.extension_group || 'NONE');
    form.append('status', body.status || 'INACTIVE');
    form.append('campaign_id', body.campaign_id || '4554');
    form.append('on_hook_agent', body.on_hook_agent || 'N');
    form.append('on_hook_ring_time', body.on_hook_ring_time || '15');
    form.append('SUBMIT', 'SUBMIT');

    if (body.agent_id) {
      form.append('agent_id', body.agent_id); 
    }


    const authString = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const basicAuthHeader = `Basic ${authString}`;

    const config = {
      method: 'post',
      url: this.uploadUrlAgente,
      maxBodyLength: Infinity,
      headers: {
        'Authorization': basicAuthHeader,
        ...form.getHeaders(),
      },
      data: form,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request(config)
      );
      
      return {
        status: 200,
        message: 'El agente fue agregado/actualizado correctamente en Vicidial..',
      };
      
    } catch (error) {
      this.logger.error(`Error en upload a Vicidial: ${error.message}`);
      throw new Error(`Error en upload: ${error.message}`);
    }
  }


}
