import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'chat_room_messages',
  timestamps: true,
  paranoid: true,
})
export class ChatRoomMessage extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

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
    field: 'chat_room_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del chat room del mensaje',
  })
  chatRoomId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'sender_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del usuario que envió el mensaje',
  })
  senderId: number;

  @BelongsTo(() => User)
  sender: User;

  @Column({
    field: 'resource_url',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Recurso adjunto, si aplica (URL o resource ID)',
  })
  resourceUrl: string;

  @Column({
    field: 'is_read',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Mensaje leído o no',
  })
  isRead: boolean;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @ForeignKey(() => User)
  @Column({ field: 'created_by', allowNull: true })
  declare createdBy: number;

  @BelongsTo(() => User, 'createdBy')
  declare createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updated_by', allowNull: true })
  declare updatedBy: number;

  @BelongsTo(() => User, 'updatedBy')
  declare updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deleted_by', allowNull: true })
  declare deletedBy: number;

  @BelongsTo(() => User, 'deletedBy')
  declare deletedByUser?: User;

  @CreatedAt
  @Column({ field: 'created_at', allowNull: true })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', allowNull: true })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', allowNull: true })
  declare deletedAt: Date;
}
