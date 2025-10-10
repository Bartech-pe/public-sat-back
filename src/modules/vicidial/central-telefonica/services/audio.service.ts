// audio.service.ts
import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AudioService {

  private vicidialHost = '195.26.249.9';
  private vicidialPort = 23022;
  private vicidialUser = 'custom';
  private vicidialPass = 'cxbQc5VxrfRTte0Wh3tLbOs1XA';
  private remotePath = '/var/lib/asterisk/sounds';

  constructor(
      @InjectModel(AudioStoreDetails, 'central')
      private readonly audioRepo: typeof AudioStoreDetails,
      @InjectModel(VicidialLists, 'central')
      private readonly modelList: typeof VicidialLists,

      @InjectModel(VicidialLead, 'central')
      private readonly modelLead: typeof VicidialLead,
  ) {}

  findAllList(): Promise<VicidialLists[]> {
      return this.modelList.findAll();
  }

  async createlistas(body: CreateVicidialListDto): Promise<{
      status: 'created' | 'exists';
      data: VicidialLists;
    }>{
        const { list_id, campaign_id, list_name, list_description, active, dtoList } = body;
  
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

        const leadsToCreate = dtoList.map(lead => ({
          ...lead,
          list_id, 
        }));

       const createdLeads = await this.modelLead.bulkCreate(leadsToCreate);

        return {
          status: 'created',
          data: createdList
        };
  }

  async processAndUpload(file: Express.Multer.File) {
      const tempDir = path.join(process.cwd(), 'tmp');
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
