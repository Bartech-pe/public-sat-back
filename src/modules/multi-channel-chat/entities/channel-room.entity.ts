import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  BelongsTo,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { ChannelCitizen } from './channel-citizen.entity';
import { ChannelMessage } from './channel-message.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { ChatStatus } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { ChannelAttention } from './channel-attention.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deleted_at', 'deleted_by'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'channel_rooms',
  timestamps: true,
  paranoid: true,
})
export class ChannelRoom extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Inbox)
  @Column({
    field: 'inbox_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  inboxId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
    allowNull: true,
  })
  userId?: number | null;

  @Column({
    field: 'external_channel_room_id',
    type: DataType.STRING,
    allowNull: false,
    unique: false,
    comment: 'Channel-specific ChannelRoom ID (e.g., Telegram chatId)',
  })
  externalChannelRoomId: string;

  @ForeignKey(() => ChannelCitizen)
  @Column({
    field: 'channel_citizen_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelCitizenId: number;

  @Column({
    field: 'status',
    type: DataType.ENUM('pendiente', 'prioridad', 'completado'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'ChannelRoom status',
  })
  status: ChatStatus;

  @Column({
    field: 'bot_replies',
    type: DataType.BOOLEAN,
    allowNull: false,
    comment: 'ChannelRoom bot status',
  })
  botReplies: boolean;

  @BelongsTo(() => ChannelCitizen, { foreignKey: 'channel_citizen_id' })
  citizen: ChannelCitizen;

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'user'})
  user: User;

  @BelongsTo(() => Inbox, { foreignKey: 'inbox_id' })
  inbox: Inbox;

  @HasMany(() => ChannelMessage)
  messages: ChannelMessage[];

  @HasMany(() => ChannelAttention)
  assistances: ChannelAttention[];

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
