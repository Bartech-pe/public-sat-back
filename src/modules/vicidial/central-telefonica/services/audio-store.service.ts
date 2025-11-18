import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as path from 'path';
import * as fs_unico from 'fs';
import { AudioStoreDetails } from '../entities/audio-store-details.entity';
import { VicidialLists } from '../entities/vicidial-lists.entity';
import { CreateVicidialListDto } from '../dto/create-vicidial-lists.dto';
import * as XLSX from 'xlsx';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { audiobaseConfig, vicidialConfig } from 'config/env';
import { promisify } from 'util';
import * as FormData from 'form-data';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { VicidialUserService } from './vicidial-user.service';
import axios, { AxiosError } from 'axios';
import { AudioStoreDetailsRepository } from '../repositories/audio-store-details.repository';
import { VicidialListsRepository } from '../repositories/vicidial-lists.repository';
import { VicidialLeadRepository } from '../repositories/vicidial-lead.repository';
import { AudioCampaignRepository } from '@modules/campaigns/audio-campaign/repositories/audio-campaign.repository';
import { DatabaseCentralService } from '@database/central/database-central.service';
import { QueryTypes, Sequelize } from 'sequelize';


const writeFileAsync = promisify(fs_unico.writeFile);
const unlinkAsync = promisify(fs_unico.unlink);

@Injectable()
export class AudioStoreService {
 
  private readonly logger = new Logger(AudioStoreService.name);

  private readonly uploadUrl =
    vicidialConfig.host + '/vicidial/audio_store.php';
  private readonly uploadUrlAgente =
    vicidialConfig.host + '/vicidial/admin.php';
  private readonly username = vicidialConfig.user;
  private readonly password = vicidialConfig.pass;

  constructor(
    private readonly audioRepo: AudioStoreDetailsRepository,
    private readonly modelList: VicidialListsRepository,
    private readonly modelLead: VicidialLeadRepository,
    @InjectQueue('register-details-audio')
    private readonly audioQueue: Queue,
    //private readonly gateway: PortfolioGateway,
    private readonly httpService: HttpService,
    private readonly vicidialUserService: VicidialUserService,
    private readonly repository: AudioCampaignRepository,
    private readonly dbCentralService: DatabaseCentralService,
  ) {}

  private get db(): Sequelize | null {
    return this.dbCentralService.getConnection();
  }

  async getAudioStoreDirectory(): Promise<{ url: string }> {
    if (!this.db) {
      throw new InternalServerErrorException(
        'No se pudo otener la conexión con la base de datos de la central telefónica.',
      );
    }
    const [directory]: any = await this.db.query(
      `SELECT sounds_web_server as domain, sounds_web_directory as endpoint
      FROM system_settings
      LIMIT 1;
      `,
      {
        replacements: [],
        type: QueryTypes.SELECT,
      },
    );

    return {
      url: directory ? `${directory?.domain}/${directory?.endpoint}/` : '/',
    };
  }

  findAllList(): Promise<VicidialLists[]> {
    return this.modelList.getModel()!.findAll();
  }

  findAllAudiosList(): Promise<AudioStoreDetails[]> {
    return this.audioRepo.getModel()!.findAll();
  }

  findAllListByCampaign(campaignId: string): Promise<VicidialLists[]> {
    return this.modelList.getModel()!.findAll({
      where: { campaign_id: campaignId },
    });
  }

  async createlistas(
    body: CreateVicidialListDto,
  ): Promise<{ status: 'created' | 'exists'; data: VicidialLists }> {
    const { list_id, campaign_id, list_name, list_description, active } = body;

    const existing = await this.modelList
      .getModel()!
      .findOne({ where: { list_id } });

    if (existing) {
      return {
        status: 'exists',
        data: existing,
      };
    }

    const createdList = await this.modelList.getModel()!.create({
      list_id,
      campaign_id,
      list_name,
      list_description,
      active,
    });

    return {
      status: 'created',
      data: createdList,
    };
  }

  async createlistar(
    dto: Omit<CreateVicidialListDto, 'file'>,
    file: Express.Multer.File,
  ): Promise<{ status: 'duplicate' | 'new'; data: VicidialLists }> {

    console.log(dto);
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

      const existingList = await this.modelList.getModel()!.findOne({
        where: { list_id: dto.list_id },
      });

      if (existingList) {
          return {
            status: 'duplicate',
            data: existingList,
          };
      }

      const result = await this.modelList.getModel()!.create({ ...dto });

      const newCampaignData = {
        name: dto.list_name,
        description: dto.list_description,
        departmentId: dto.departmentId,
        vdlistId: dto.list_id,
        startDate: new Date(),
        endDate: new Date(),
        applyHoliday: false,
        validUntil: new Date(),
        vdCampaignId: dto.campaign_id,
        vdCampaignName: dto.campaign_name,
        status: true,
      };

      const crmList = this.repository.create(newCampaignData);

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
      });

      const list = result.get({ plain: true });
      await this.audioQueue.add('register-details-audio', {
        list_id: list.list_id,
        detalles: validLeads,
        type: 0,
      });

      return {
          status: 'new',
          data: result,
      };
      
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async createlistarMultiple(
    dto: Omit<CreateVicidialListDto, 'file'>,
    file: Express.Multer.File,
  ): Promise<{ status: string; data: VicidialLists }> {
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

      const existingList = await this.modelList.getModel()!.findOne({
        where: { list_id: dto.list_id },
      });

      if (existingList) {
          return {
            status: 'duplicate',
            data: existingList,
          };
      }

      const result = await this.modelList.getModel()!.create({ ...dto });

      const newCampaignData = {
        name: dto.list_name,
        description: dto.list_description,
        departmentId: dto.departmentId,
        vdlistId: dto.list_id,
        startDate: new Date(),
        endDate: new Date(),
        applyHoliday: false,
        validUntil: new Date(),
        vdCampaignId: dto.campaign_id,
        vdCampaignName: dto.campaign_name,
        status: false,
      };

      const crmList = await this.repository.create(newCampaignData);

      const agents: any =
        await this.vicidialUserService.getVicidialRemoteAgents(dto.campaign_id);

      const validLeads = data.map((row: any, index: number) => {
        const telefono = row.phone_number?.toString().trim();

        if (!telefono) return null;

        return {
          first_name: '',
          last_name: '',
          phone_number: telefono,
          status: 'NEW',
          crm_campaign_id: crmList.id,
          script_text: row.script_text?.toString().trim(),
          asterisk_server_ip: agents.server_ip,
        };
      });

      const list = result.get({ plain: true });
      await this.audioQueue.add('register-details-audio', {
        list_id: list.list_id,
        detalles: validLeads,
        type: 1,
      });

      return {
          status: 'new',
          data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async savePortfolioDetails(
    list_id: number,
    detallesComplete: any[],
    type: number,
  ) {
    const BATCH_SIZE = 500;
    const total = detallesComplete.length;
    let processed = 0;
 
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = detallesComplete.slice(i, i + BATCH_SIZE);

      const leadsToCreate = batch.map((lead) => ({
        first_name: lead.first_name,
        last_name: lead.last_name,
        phone_number: lead.phone_number,
        status: lead.status,
        list_id,
      }));

      const leadsCreated = await this.modelLead
        .getModel()!
        .bulkCreate(leadsToCreate, {
          returning: true,
        });
      if (type == 1) {
        const tasks = leadsCreated.map((created, index) => ({
          crm_campaign_id: String(batch[index].crm_campaign_id),
          vicidial_lead_id: created.get('lead_id'),
          phone_number: created.get('phone_number'),
          script_text: batch[index].script_text,
          asterisk_server_ip: batch[index].asterisk_server_ip,
        }));

        const newlist = {
          tasks: tasks,
        };

        try {
          const response = await axios.post(
            `${audiobaseConfig.url}/api/audio-tasks/bulk-create`,
            { tasks },
          );
          console.log('API audio-tasks response:', response.data);
        } catch (error) {
          console.error(
            'Error al enviar tareas a API audio-tasks:',
            error.message,
          );
        }

      }

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

    const tempFileName = file.originalname;
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

    const authString = Buffer.from(
      `${this.username}:${this.password}`,
    ).toString('base64');
    const basicAuthHeader = `Basic ${authString}`;

    const config = {
      method: 'post',
      url: this.uploadUrl,
      maxBodyLength: Infinity,
      headers: {
        Authorization: basicAuthHeader,
        ...form.getHeaders(),
      },
      data: form,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(config));

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

  async updateList(
    listId: number,
    dto: any,
  ): Promise<{ status: 'updated'; data: any } | { status: 'not_found' }> {
    try {
      const exist = await this.repository.findOne({ where: { id: listId } });

      if (!exist) {
        return { status: 'not_found' };
      }

      await exist.update({ active: dto.active });

      const existLead = await this.modelList.getModel()!.findOne({
        where: { list_id: dto.vdlistId },
      });

      if (existLead) {
        await existLead.update({ active: dto.active });
      }

      return {
        status: 'updated',
        data: exist,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error interno del servidor: ' + error.message,
      );
    }
  }

  async findAllBylistasMultiple(campaignId: string): Promise<any> {
    const url = `${audiobaseConfig.url}/api/campaign-status/${campaignId}`;

    try {
      const response = await axios.get(url, {
        headers: { Accept: 'application/json' },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      const err = error as AxiosError;

      if (err.response) {
        this.logger.error(
          `Error ${err.response.status} al consultar campaña ${campaignId}: ${JSON.stringify(err.response.data)}`,
        );
      }

      return {
        success: false,
        message: 'Error consultando estado de campaña',
        campaignId,
      };
    }
  }
}
