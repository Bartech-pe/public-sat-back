import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { ChatRoomRepository } from './repositories/chat-room.repository';
import { UserChatRoomRepository } from './repositories/user-chat-room.repository';
import { MessageRepository } from './repositories/message.repository';
import { User } from '@modules/user/entities/user.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { Message } from './entities/message.entity';
import { Op } from 'sequelize';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatRoomService {
  constructor(
    private readonly roomRepository: ChatRoomRepository,
    private readonly userRoomRepository: UserChatRoomRepository,
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(
    limit: number,
    offset: number,
    idUser: number,
  ): Promise<PaginatedResponse<ChatRoom>> {
    try {
      return this.roomRepository.findAndCountAll({
        include: [
          {
            model: User,
            as: 'filteredUsers', // solo para filtrar por participación
            where: { id: idUser },
            attributes: [],
            through: { attributes: [] },
            required: true,
          },
          {
            model: User,
            as: 'users', // para obtener todos los miembros del room
            // where: { id: { [Op.ne]: idUser } },
            through: { attributes: [] },
          },
          {
            model: Message,
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

  async createMessage(idSender: number, idChatRoom: number, content: string) {
    const message = await this.messageRepository.create({
      idSender,
      idChatRoom,
      content,
    });

    return message;
  }

  async getMessages(idChatRoom: number) {
    return this.messageRepository.findAll({
      where: { idChatRoom },
      include: [{ model: User }],
      order: [['createdAt', 'ASC']],
    });
  }

  async createRoom(
    currentUserId: number,
    otherUserIds: number[],
    name?: string,
  ) {
    const room = await this.roomRepository.create({ name });

    const associations = [currentUserId, ...otherUserIds].map((idUser) => ({
      idUser,
      idChatRoom: room.get().id,
    }));

    await this.userRoomRepository.bulkCreate(associations);

    return room;
  }

  async createRoomMultiple(
      currentUserId: number,
      otherUserIds: number[],
      name?: string
    ) {
      const allUserIds = [currentUserId, ...otherUserIds];
      const isGroup = allUserIds.length > 2; // 👈 Lo determinamos aquí

      const room = await this.roomRepository.create({
        name: isGroup ? name : undefined,
        isGroup,
      });

      const associations = allUserIds.map((idUser) => ({
        idUser,
        idChatRoom: room.get().id,
      }));

      await this.userRoomRepository.bulkCreate(associations);

      return room;
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
      { idUser: userId1, idChatRoom: newRoom.id },
      { idUser: userId2, idChatRoom: newRoom.id },
    ]);

    return newRoom;
  }

  async createRoomMessage(dto: CreateMessageDto): Promise<Message> {
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

  removeUserGroup(id: number): Promise<void> {
     try {
       return this.userRoomRepository.delete(id);
     } catch (error) {
       throw new InternalServerErrorException(
         error,
         'Error interno del servidor',
       );
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
