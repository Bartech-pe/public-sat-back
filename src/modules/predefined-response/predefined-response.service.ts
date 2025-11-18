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
import { ChannelAvailable } from '@common/constants/channel.constant';
import { col, fn, literal, Op, Order, where } from 'sequelize';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { CategoryChannel } from '@modules/channel/entities/category-channel.entity';

@Injectable()
export class PredefinedResponseService {
  constructor(private readonly repository: PredefinedResponseRepository) {}

  async findAll(
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<PredefinedResponse>> {
    try {
      const { categoryId, orderField, searchText = '' } = q || {};
      const searchTerm = searchText.toLowerCase();

      const whereOptions: any = { categoryId };

      // Búsqueda por nombre o email (solo si hay texto)
      if (searchTerm) {
        const safeTerm = searchTerm.replace(/'/g, "''"); // prevenir inyección SQL
        whereOptions[Op.or] = [
          where(fn('LOWER', col('PredefinedResponse.title')), {
            [Op.like]: `%${safeTerm}%`,
          }),
          where(fn('LOWER', col('PredefinedResponse.content')), {
            [Op.like]: `%${safeTerm}%`,
          }),
        ];
      }

      // Ordenamiento
      const order: Order = orderField
        ? [[orderField.field, orderField.order]]
        : [['id', 'DESC']];

      return this.repository.findAndCountAll({
        where: whereOptions,
        subQuery: false,
        limit,
        offset,
        order,
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

  async copyToOtherChannels(
    predefinedResponseId: number,
  ): Promise<BaseResponseDto> {
    let response: BaseResponseDto = {
      message: '',
      success: false,
    };
    try {
      const channelCategories: number[] = [
        ChannelAvailable.EMAIL,
        ChannelAvailable.CHAT,
        ChannelAvailable.WSP,
      ];

      const predefinedResponse: PredefinedResponse = (
        await this.repository.findById(predefinedResponseId)
      ).toJSON();

      let otherChannels = channelCategories.filter(
        (categoryChannel) => predefinedResponse.categoryId != categoryChannel,
      );
      otherChannels.forEach(async (categoryChannel: number) => {
        const predefinedResponseExists = await this.repository.findAll({
          where: {
            categoryId: {
              [Op.in]: otherChannels,
            },
            code: predefinedResponse.code,
            title: predefinedResponse.title,
            content: predefinedResponse.content,
            keywords: predefinedResponse.keywords,
            status: predefinedResponse.status,
          },
        });
        if (!predefinedResponseExists.length) {
          await this.repository.create({
            categoryId: categoryChannel,
            code: predefinedResponse.code,
            title: predefinedResponse.title,
            content: predefinedResponse.content,
            keywords: predefinedResponse.keywords,
            status: predefinedResponse.status,
          });
        }
      });
      response.message =
        'Esta respuesta predefinida se ha creado correctamente para todos los otros canales.';
      response.success = true;
      return response;
    } catch (error) {
      response.error = error.toString();
      return response;
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
        categoryId: CategoryChannelEnum.MAIL,
      },
    });
  }

  allPredefinedResponseChatSat(): Promise<PredefinedResponse[]> {
    return this.repository.findAll({
      where: {
        categoryId: CategoryChannelEnum.CHATSAT,
      },
    });
  }

  allPredefinedResponseWhatsapp(): Promise<PredefinedResponse[]> {
    return this.repository.findAll({
      where: {
        categoryId: CategoryChannelEnum.WHATSAPP,
      },
    });
  }
}
