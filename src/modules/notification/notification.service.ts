import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Notification>> {
    try {
      console.log("======================",user)
      const whereOpts = {
        where: {
          userId: user.id,
        },
      };
      
      return this.repository.findAndCountAll({
        ...whereOpts,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException(
        'Error al obtener las notificaciones',
      );
    }
  }

  async findOne(id: number): Promise<Notification> {
    try {
      const notification = await this.repository.findOne({
        where: { id },
      });
      if (!notification) {
        throw new NotFoundException('Notificación no encontrada');
      }
      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la notificación',
      );
    }
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    try {
      return this.repository.create(dto);
    } catch (error) {
      console.error('Error in create:', error);
      throw new InternalServerErrorException(
        'Error al crear la notificación',
      );
    }
  }

  async update(
    id: number,
    dto: UpdateNotificationDto,
  ): Promise<Notification> {
    try {
      const notification = await this.repository.findById(id);
      if (!notification) {
        throw new NotFoundException('Notificación no encontrada');
      }

      await notification.update(dto);
      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al actualizar la notificación',
      );
    }
  }

  async markAsRead(id: number): Promise<Notification> {
    try {
      const notification = await this.repository.findById(id);
      if (!notification) {
        throw new NotFoundException('Notificación no encontrada');
      }

      await notification.update({ isRead: true });
      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al marcar la notificación como leída',
      );
    }
  }

//   async markAllAsRead(userId: number): Promise<void> {
//     try {
//       await this.repository.updateAll(
//         { isRead: true },
//         { where: { userId, isRead: false } },
//       );
//     } catch (error) {
//       console.error('Error in markAllAsRead:', error);
//       throw new InternalServerErrorException(
//         'Error al marcar todas las notificaciones como leídas',
//       );
//     }
//   }

  async remove(id: number): Promise<void> {
    try {
      const notification = await this.repository.findById(id);
      if (!notification) {
        throw new NotFoundException('Notificación no encontrada');
      }
      return this.repository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al eliminar la notificación',
      );
    }
  }
}
