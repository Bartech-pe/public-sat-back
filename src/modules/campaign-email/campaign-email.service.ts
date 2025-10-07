import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCampaignEmailDto } from './dto/create-campaign-email.dto';
import { UpdateCampaignEmailDto } from './dto/update-campaign-email.dto';
import { CampaignEmailRepository } from './repositories/campaign-email.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CampaignEmail } from './entities/campaign-email.entity';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class CampaignEmailService {

   constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue,
   private readonly repository: CampaignEmailRepository) {}

  async enqueueEmails(emails: CreateCampaignEmailDto[]) {
    // Insertar todos los correos en la cola
    const jobs = await Promise.all(
      emails.map((email) =>
        this.emailQueue.add('send-email', email, {
          removeOnComplete: true,
          removeOnFail: false,
        }),
      ),
    );

    return {
      message: 'Correos encolados correctamente',
      count: jobs.length,
      jobs: jobs.map((job) => job.id),
    };
  }
  
  async findAll(
      limit: number,
      offset: number,
    ): Promise<PaginatedResponse<CampaignEmail>> {
      try {
        return this.repository.findAndCountAll({
          limit,
          offset,
          order: [['id', 'DESC']],
        });
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }
  
    async findOne(id: number): Promise<CampaignEmail> {
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
  
    async create(dto: CreateCampaignEmailDto): Promise<CampaignEmail> {
      try {
        return this.repository.create(dto);
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }
  
    async bulkCreate(dtoList: CreateCampaignEmailDto[]): Promise<CampaignEmail[]> {
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
  
    async update(id: number, dto: UpdateCampaignEmailDto): Promise<CampaignEmail> {
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
  
    async toggleTag(id: number): Promise<CampaignEmail> {
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
}
