import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMensajeAutomaticoDto } from './dto/create-mensaje-automatico.dto';
import { UpdateMensajeAutomaticoDto } from './dto/update-mensaje-automatico.dto';
import { MensajeAutomaticoRepository } from './repositories/mensaje-automatico.repository';
import { MensajeAutomatico } from './entities/mensaje-automatico.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class MensajeAutomaticoService {
  constructor(private readonly repository: MensajeAutomaticoRepository) {}

  async findAll(
    offset: number,
  ): Promise<PaginatedResponse<MensajeAutomatico>> {
    try {
      return this.repository.findAndCountAll({
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

  async update(
    id: number,
    dto: UpdateMensajeAutomaticoDto,
  ): Promise<MensajeAutomatico> {
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

    async create(dto: CreateMensajeAutomaticoDto): Promise<MensajeAutomatico> {
      try {
        return this.repository.create(dto);
      } catch (error) {
        throw new InternalServerErrorException(
          error,
          'Error interno del servidor',
        );
      }
    }


  remove(id: number) {
    return `This action removes a #${id} mensajeAutomatico`;
  }
}
