import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ChannelRoom } from './channel-room.entity';
import { MessageStatus } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { ChannelAttention } from './channel-attention.entity';
import { User } from '@modules/user/entities/user.entity';
import { ChannelMessageAttachment } from './channel-message-attachments.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deleted_at', 'deleted_by'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'channel_messages',
  timestamps: true,
  paranoid: true,
  indexes: [{ fields: ['channelRoomId'] }],
})
export class ChannelMessage extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => ChannelRoom)
  @Column({
    field: 'channel_room_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelRoomId: number;

  @ForeignKey(() => ChannelAttention)
  @Column({
    field: 'channel_attention_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  assistanceId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
    allowNull: true,
  })
  userId?: number | null;

  @Column({
    field: 'content',
    type: DataType.TEXT,
    allowNull: false,
    comment: 'ChannelMessage content',
  })
  content: string;

  @Column({
    field: 'external_message_id',
    type: DataType.STRING,
    allowNull: true,
    comment: 'ChannelMessage content Id',
  })
  externalMessageId?: string;

  @Column({
    field: 'status',
    type: DataType.ENUM('read', 'unread'),
    allowNull: false,
    defaultValue: 'unread',
    comment: 'ChannelMessage read status',
  })
  status: MessageStatus;

  @Column({
    field: 'sender_type',
    type: DataType.ENUM('agent', 'citizen', 'bot'),
    allowNull: false,
    comment: 'Type of sender',
  })
  senderType: 'agent' | 'citizen' | 'bot';

  @Column({
    field: 'timestamp',
    type: DataType.DATE,
    allowNull: false,
    comment: 'ChannelMessage timestamp',
  })
  timestamp: Date;

  @BelongsTo(() => ChannelRoom)
  channelRoom: ChannelRoom;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => ChannelAttention)
  attention: ChannelAttention;

  @HasMany(() => ChannelMessageAttachment)
  attachments: ChannelMessageAttachment[];

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
