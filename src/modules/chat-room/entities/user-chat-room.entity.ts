import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  DataType,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

@Table({
  tableName: 'user_chat_rooms',
  timestamps: true,
  paranoid: true
})
export class UserChatRoom extends Model {
  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del chat room del mensaje',
  })
  userId: number;

  @ForeignKey(() => ChatRoom)
  @Column({
    field: 'chat_room_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del chat room del mensaje',
  })
  chatRoomId: number;

  @Column({
    field: 'last_read_at',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Última vez que leyó los mensajes',
  })
  lastReadAt: Date;

  @Column({
    field: 'is_active',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Si el participante está activo en la conversación',
  })
  isActive: boolean;

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

  @BelongsTo(() => User, 'created_by')
  declare createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updated_by', allowNull: true })
  declare updatedBy: number;

  @BelongsTo(() => User, 'updated_by')
  declare updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deleted_by', allowNull: true })
  declare deletedBy: number;

  @BelongsTo(() => User, 'deleted_by')
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
