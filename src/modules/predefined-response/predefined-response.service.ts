import { PredefinedResponse } from './entities/predefined-response.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PredefinedResponseRepository } from './repositories/predefined-response.repository';
import { CreatePredefinedResponseDto } from './dto/create-predefined-response.dto';
import { UpdatePredefinedResponseDto } from './dto/update-predefined-response.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CategoryChannelEnum } from '@common/enums/category-channel.enum';

@Injectable()
export class PredefinedResponseService {

  constructor(private readonly repository: PredefinedResponseRepository) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<PredefinedResponse>> {
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

  async findOne(id: number): Promise<PredefinedResponse> {
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

  async create(dto: CreatePredefinedResponseDto): Promise<PredefinedResponse> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(
    dtoList: CreatePredefinedResponseDto[],
  ): Promise<PredefinedResponse[]> {
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
    dto: UpdatePredefinedResponseDto,
  ): Promise<PredefinedResponse> {
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

  async togglePredefinedResponse(id: number): Promise<PredefinedResponse> {
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

  allPredefinedResponseMail(): Promise<PredefinedResponse[]> {
    return this.repository.findAll({
      where: {
        categoryId: CategoryChannelEnum.MAIL
      }
    })
  }
  
  allPredefinedResponseChatSat(): Promise<PredefinedResponse[]> {
    return this.repository.findAll({
      where: {
        categoryId: CategoryChannelEnum.CHATSAT
      }
    })
  }
  
  allPredefinedResponseWhatsapp(): Promise<PredefinedResponse[]> {
    return this.repository.findAll({
      where: {
        categoryId: CategoryChannelEnum.WHATSAPP
      }
    })
  }
}
