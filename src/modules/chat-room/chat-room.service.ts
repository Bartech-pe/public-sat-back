import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { UserChatRoomRepository } from './repositories/user-chat-room.repository';
import { ChatRoomMessageRepository } from './repositories/chat-room-message.repository';
import { User } from '@modules/user/entities/user.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { ChatRoomMessage } from './entities/chat-room-message.entity';
import { Op } from 'sequelize';
import { CreateMessageDto } from './dto/create-message.dto';
import { MultiChannelChatService } from '@modules/multi-channel-chat/multi-channel-chat.service';

@Injectable()
export class ChatRoomService {
  private readonly logger = new Logger(MultiChannelChatService.name);
  
  constructor(
    private readonly roomRepository: ChatRoomRepository,
    private readonly userRoomRepository: UserChatRoomRepository,
    private readonly messageRepository: ChatRoomMessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(
    limit: number,
    offset: number,
    userId: number,
  ): Promise<PaginatedResponse<ChatRoom>> {
    try {
      return this.roomRepository.findAndCountAll({
        include: [
          {
            model: User,
            as: 'filteredUsers', // solo para filtrar por participación
            where: { id: userId },
            attributes: [],
            through: { attributes: [] },
            required: true,
          },
          {
            model: User,
            as: 'users', // para obtener todos los miembros del room
            // where: { id: { [Op.ne]: userId } },
            through: { attributes: [] },
          },
          {
            model: ChatRoomMessage,
            separate: true,
            limit: 1,
            order: [['createdAt', 'DESC']],
          },
        ],
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

  async createMessage(senderId: number, chatRoomId: number, content: string) {
    const message = await this.messageRepository.create({
      senderId,
      chatRoomId,
      content,
    });

    return message;
  }

  async getMessages(chatRoomId: number): Promise<ChatRoomMessage[]> {
    return this.messageRepository.findAll({
      where: { chatRoomId },
      include: [{ model: User, as: 'sender' }],
      order: [['createdAt', 'ASC']],
    });
  }

  async createRoom(
    currentUserId: number,
    otherUserIds: number[],
    name?: string,
  ) {
    const room = await this.roomRepository.create({ name });

    const associations = [currentUserId, ...otherUserIds].map((userId) => ({
      userId,
      chatRoomId: room.get().id,
    }));

    await this.userRoomRepository.bulkCreate(associations);

    return room;
  }

  async createRoomMultiple(
    currentUserId: number,
    otherUserIds: number[],
    name?: string,
  ) {
    try {

      const filteredOtherUserIds = otherUserIds.filter(
        (id) => id !== currentUserId,
      );
      const allUserIds = [currentUserId, ...filteredOtherUserIds];
      const isGroup = allUserIds.length > 2;  
  
      const room = await this.roomRepository.create({
        name: isGroup ? name : undefined,
        isGroup,
      });
  
      const associations = allUserIds.map((userId) => ({
        userId,
        chatRoomId: room.get().id,
      }));
  
      await this.userRoomRepository.bulkCreate(associations);
  
      return room;
    } catch (error) {
      this.logger.error(error.toString())
    }
  }

  async getOrCreatePrivateRoom(
    otherUserId: number,
    currentUserId: number,
    name?: string,
  ): Promise<ChatRoom> {
    // Suponiendo que tienes acceso al ID del usuario actual
    const userId1 = currentUserId; // reemplaza con JWT, etc.
    const userId2 = otherUserId;

    const rooms = await this.roomRepository.findAll({
      include: [
        {
          model: User,
          as: 'users',
          where: { id: [userId1, userId2] },
          through: { attributes: [] },
        },
      ],
    });

    for (const room of rooms) {
      const users = await room.$get('users');
      const ids = users.map((u) => u.id).sort();
      if (ids.length === 2 && ids.includes(userId1) && ids.includes(userId2)) {
        return room; // sala privada ya existe
      }
    }

    // Si no existe, crear una nueva
    const newRoom = await this.roomRepository.create({ name: name });
    await this.userRoomRepository.bulkCreate([
      { userId: userId1, chatRoomId: newRoom.id },
      { userId: userId2, chatRoomId: newRoom.id },
    ]);

    return newRoom;
  }

  async createRoomMessage(dto: CreateMessageDto): Promise<ChatRoomMessage> {
    try {
      return this.messageRepository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  //eliminar mensajes de la tabla message

  removeRoomMessage(id: number): Promise<void> {
    try {
      return this.messageRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  restoreRoomMessage(id: number): Promise<void> {
    try {
      return this.messageRepository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  //eliminar mensajes de la tabla userchatrooms

  removeRoom(id: number): Promise<void> {
    try {
      return this.roomRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  restoreRoom(id: number): Promise<void> {
    try {
      return this.roomRepository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  //eliminar mensajes de la tabla userchatrooms

  async removeUserGroup(id: number): Promise<void> {
    try {
      return await this.userRoomRepository.delete(id);
    } catch (error) {
      this.logger.error(error.toString())
    }
  }

  restoreUserGroup(id: number): Promise<void> {
    try {
      return this.userRoomRepository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
}
