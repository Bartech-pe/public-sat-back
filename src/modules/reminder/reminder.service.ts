import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderRepository } from './repositories/reminder.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Reminder } from './entities/reminder.entity';

@Injectable()
export class ReminderService {

  constructor(private readonly repository: ReminderRepository) {}
    
      async findAll(
        limit: number,
        offset: number,
      ): Promise<PaginatedResponse<Reminder>> {
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
    
      async findOne(id: number): Promise<Reminder> {
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
    
      async create(dto: CreateReminderDto): Promise<Reminder> {
        try {
          return this.repository.create(dto);
        } catch (error) {
          throw new InternalServerErrorException(
            error,
            'Error interno del servidor',
          );
        }
      }
    
      async bulkCreate(dtoList: CreateReminderDto[]): Promise<Reminder[]> {
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
    
      async update(id: number, dto: UpdateReminderDto): Promise<Reminder> {
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
    
      async toggleReminder(id: number): Promise<Reminder> {
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
