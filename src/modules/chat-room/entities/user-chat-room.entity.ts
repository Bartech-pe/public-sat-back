import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  DataType,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

@Table({
  tableName: 'userChatRooms',
  timestamps: true,
  paranoid: true,
})
export class UserChatRoom extends Model {
  @ForeignKey(() => User)
  @Column
  idUser: number;

  @ForeignKey(() => ChatRoom)
  @Column
  idChatRoom: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Última vez que leyó los mensajes',
  })
  lastReadAt: Date;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Si el participante está activo en la conversación',
  })
  isActive: boolean;

  @DeletedAt
  declare deletedAt: Date;
}
