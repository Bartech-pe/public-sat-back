import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCampaingEmailConfigDto } from './dto/create-campaing-email-config.dto';
import { UpdateCampaingEmailConfigDto } from './dto/update-campaing-email-config.dto';
import { CampaignEmailConfigRepository } from './repositories/campaign-email-config.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CampaignEmailConfig } from './entities/campaing-email-config.entity';
import { TemplateEmail } from '@modules/template-email/entities/template-email.entity';
import { CampaignEmail } from '@modules/campaign-email/entities/campaign-email.entity';
import { CampaignEmailRepository } from '@modules/campaign-email/repositories/campaign-email.repository';

@Injectable()
export class CampaingEmailConfigService {
  constructor(private readonly repository: CampaignEmailConfigRepository,
     private readonly repositoryCampaignEmail: CampaignEmailRepository
  ) {}
  
    async findAll(
      limit: number,
      offset: number,
    ): Promise<PaginatedResponse<CampaignEmailConfig>> {
      try {
        return this.repository.findAndCountAll({
          limit,
          offset,
          order: [['id', 'DESC']],
            include: [
            {
              model: TemplateEmail,
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
  
    async findOne(id: number): Promise<CampaignEmailConfig> {
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

    async findOneAll(id: number): Promise<CampaignEmail[]> {
      try {
        return await this.repositoryCampaignEmail.findAll({
          where: {
            idCampaignEmailConfig: id,
          },
          order: [['id', 'DESC']]
        });
      } catch (error) {
        console.error('Error en findOneAll:', error);
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }
  
    async create(dto: CreateCampaingEmailConfigDto): Promise<CampaignEmailConfig> {
      try {
        return this.repository.create(dto);
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }
  
    async bulkCreate(dtoList: CreateCampaingEmailConfigDto[]): Promise<CampaignEmailConfig[]> {
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
  
    async update(id: number, dto: UpdateCampaingEmailConfigDto): Promise<CampaignEmailConfig> {
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
  
    async toggleCampaignEmailConfig(id: number): Promise<CampaignEmailConfig> {
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
