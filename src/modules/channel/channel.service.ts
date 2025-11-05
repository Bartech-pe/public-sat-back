import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ChannelRepository } from './repositories/channel.repository';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateChannelUserDto } from './dto/create-channel-user.dto';

@Injectable()
export class ChannelService {
  constructor(
    private readonly repository: ChannelRepository,
  ) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Channel>> {
    try {
      return this.repository.findAndCountAll({
        limit,
        offset,
        order: [['id', 'ASC']],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findOne(id: number): Promise<Channel> {
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

  async create(dto: CreateChannelDto): Promise<Channel> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: CreateChannelDto[]): Promise<Channel[]> {
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

  // async assignment(
  //   id: number,
  //   dtoList: CreateChannelUserDto[],
  // ): Promise<ChannelUser[]> {
  //   try {
  //     const securedDtoList = await Promise.all(
  //       dtoList.map(async (dto) => ({
  //         ...dto,
  //       })),
  //     );
  //     return this.channelUserRepository.bulkCreate(securedDtoList, {
  //       updateOnDuplicate: ['idChannel', 'idUser'],
  //       individualHooks: true,
  //       ignoreDuplicates: true,
  //     });
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       error,
  //       'Error interno del servidor',
  //     );
  //   }
  // }

  async update(id: number, dto: UpdateChannelDto): Promise<Channel> {
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

  async toggleStatus(id: number): Promise<Channel> {
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
