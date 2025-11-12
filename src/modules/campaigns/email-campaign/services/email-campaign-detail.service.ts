import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmailCampaignDetailDto } from '../dto/create-email-campaign-detail.dto';
import { UpdateEmailCampaignDetailDto } from '../dto/update-email-campaign-detail.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { EmailCampaignDetailRepository } from '../repositories/email-campaign-detail.repository';
import { EmailCampaignDetail } from '../entities/email-campaign-detail.entity';

@Injectable()
export class EmailCampaignDetailService {
  constructor(
    // @InjectQueue('email-queue') private readonly emailQueue: Queue,
    private readonly repository: EmailCampaignDetailRepository,
  ) {}

  async enqueueEmails(emails: CreateEmailCampaignDetailDto[]) {
    // Insertar todos los correos en la cola
    // const jobs = await Promise.all(
    //   emails.map((email) =>
    //     this.emailQueue.add('send-email', email, {
    //       removeOnComplete: true,
    //       removeOnFail: false,
    //     }),
    //   ),
    // );

    // return {
    //   message: 'Correos encolados correctamente',
    //   count: jobs.length,
    //   jobs: jobs.map((job) => job.id),
    // };
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<EmailCampaignDetail>> {
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

  async findOne(id: number): Promise<EmailCampaignDetail> {
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

  async create(
    reqDto: CreateEmailCampaignDetailDto,
  ): Promise<EmailCampaignDetail> {
    try {
      const { attachments, ...dto } = reqDto;
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(
    dtoList: CreateEmailCampaignDetailDto[],
  ): Promise<EmailCampaignDetail[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (reqDto) => {
          const { attachments, ...dto } = reqDto;
          return {
            ...dto,
          };
        }),
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
    reqDto: UpdateEmailCampaignDetailDto,
  ): Promise<EmailCampaignDetail> {
    try {
      const { attachments, ...dto } = reqDto;

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

  async toggleStatus(id: number): Promise<EmailCampaignDetail> {
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

  async findAllByEmailCampaignId(
    emailCampaignId: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<EmailCampaignDetail>> {
    try {
      return this.repository.findAndCountAll({
        where: { emailCampaignId },
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
}
