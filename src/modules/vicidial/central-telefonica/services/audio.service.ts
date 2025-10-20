// audio.service.ts
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { PortfolioGateway } from '@modules/portfolio/portfolio.gateway';
@Injectable()
export class AudioService {

  private vicidialHost = '195.26.249.9';
  private vicidialPort = 22;
  private vicidialUser = 'admin';
  private vicidialPass = 'ZGjJtZw03Bc3VGvcMo1uq77x4T4Vq7D2tIk0VDBJzkLwf97qLaQ';


  private remotePath = '/var/lib/asterisk/sounds';

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
  ) {}

  findAllList(): Promise<VicidialLists[]> {
      return this.modelList.findAll();
  }

  async createlistas(body: CreateVicidialListDto): Promise<{
      status: 'created' | 'exists';
      data: VicidialLists;
    }>{
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

      //   const leadsToCreate = dtoList.map(lead => ({
      //     ...lead,
      //     list_id, 
      //   }));

      //  const createdLeads = await this.modelLead.bulkCreate(leadsToCreate);

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
       
         console.log(data)
      
         const result = await this.modelList.create({ ...dto });

         const validLeads = data
          .map((row: any, index: number) => {
            const telefono = row.TELEFONO?.toString().trim();
            const obligado = row.OBLIGADO?.toString().trim();

            // Validar número de teléfono y nombre obligatorio
            if (!telefono || !obligado) return null;

            return {
              first_name: obligado,
              last_name: row.PLACA?.toString().trim() || '',
              phone_number: telefono,
              status: 'NEW',
            };
          })

          console.log(result)

          const list = result.get({ plain: true });

          console.log("=====================================")
          console.log(list)

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

      // Preparar los leads con el list_id asignado
      const leadsToCreate = batch.map(lead => ({
        ...lead,
        list_id,
      }));

      // Insertar en la base de datos
      await this.modelLead.bulkCreate(leadsToCreate);

      // Actualizar progreso
      processed += batch.length;
      const percentage = Math.round((processed / total) * 100);

    }

    //this.gateway.sendComplete(total);
  }

  async processAndUpload(file: Express.Multer.File) {
    console.log("=====================================================");

      const tempDir = path.join(process.cwd(), 'tmp');

      console.log("=====================================================",tempDir);
      try {
        // Crear carpeta tmp si no existe
        await fs.mkdir(tempDir, { recursive: true });

        // Nombre único para evitar conflictos
        const uniqueName = file.originalname;

        const tempPath = path.join(tempDir, uniqueName);

        // Guardar archivo temporal
        await fs.writeFile(tempPath, file.buffer);

        // Ruta del archivo convertido
        const convertedPath = tempPath.replace(/\.[^/.]+$/, '.wav');
        const fileName = path.basename(convertedPath);

          console.log("=====================================================");
        console.log(fileName);
        // Convertir
        //const archivoaceptado=  await this.convertToAsteriskWav(tempPath, convertedPath);
    
        await this.uploadToVicidial(convertedPath);

        //await fs.unlink(tempPath);
        //await fs.unlink(convertedPath);
        //const metadata = await mm.parseFile(convertedPath);
        const fileSize = fs_unico.statSync(convertedPath).size;
        const audioLength = 7;//Math.round(metadata.format.duration || 0);
        const formatDetails = 'WAVE   channels: 1   framerate: 8000   bits: 16   length: 2   compression: pcm/uncompressed (1)';// `${metadata.format.sampleRate}Hz, ${metadata.format.bitsPerSample} bits, ${metadata.format.numberOfChannels} canales`;

        await this.audioRepo.create({
          audio_filename: fileName,
          audio_format: 'wav',
          audio_filesize: fileSize,
          audio_epoch: Math.floor(Date.now() / 1000),
          audio_length: audioLength,
          wav_format_details: formatDetails,
          wav_asterisk_valid: 'GOOD', // aquí podrías implementar validación real
        })

        if (!fs_unico.existsSync('./tmp')) {
          fs_unico.mkdirSync('./tmp');
        }
        
        await fs.readdir(tempDir);

        return { message: 'Audio subido correctamente a Vicidial' };
      
      } catch (error) {
        throw new Error('No se pudo procesar el audio');
      }
  }

  private async uploadToVicidial(filePath: string) {
      const sftp = new Client();
      await sftp.connect({
        host: this.vicidialHost,
        port: this.vicidialPort,
        username: this.vicidialUser,
        password: this.vicidialPass,
      });
      await sftp.put(filePath, `${this.remotePath}/${path.basename(filePath)}`);
      await sftp.end();
  }

  private convertToAsteriskWav(inputPath: string, outputPath: string) {
      return new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .audioFrequency(8000)
          .audioChannels(1)
          .audioCodec('pcm_s16le')
          .format('wav')
          .save(outputPath)
          .on('end', resolve)
          .on('error', reject);
      });
  }

  
}
