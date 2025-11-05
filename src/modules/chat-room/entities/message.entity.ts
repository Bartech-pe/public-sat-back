import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { User } from '@modules/user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export interface MessageAttributes {
  id: number;
  content: string;
  idChatRoom: number;
  idSender: number;
  status?: boolean;
  deletedAt?: Date;
}

export type MessageCreationAttributes = Optional<
  MessageAttributes,
  'id' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'messages',
  timestamps: true,
  paranoid: true,
})
export class Message extends Model<
  MessageAttributes,
  MessageCreationAttributes
> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @BelongsTo(() => User)
  sender: User;
  @Column({
    type: DataType.ENUM('text', 'image', 'file', 'audio', 'video'),
    allowNull: false,
  })
  type: MessageType;

  @Column({
    field: 'content',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Contenido del mensaje',
  })
  content: string;

  @ForeignKey(() => ChatRoom)
  @Column({
    field: 'idChatRoom',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del chat room del mensaje',
  })
  idChatRoom: number;

  @ForeignKey(() => User)
  @Column({
    field: 'idSender',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del usuario que envió el mensaje',
  })
  idSender: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Recurso adjunto, si aplica (URL o resource ID)',
  })
  resourceUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Mensaje leído o no',
  })
  isRead: boolean;

  @DeletedAt
  declare deletedAt: Date;
}
