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
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Channel } from '@modules/channel/entities/channel.entity';
import { User } from '@modules/user/entities/user.entity';
import { Citizen } from './citizen.entity';
import { ChannelMessage } from './channel-message.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { InboxUser } from '@modules/inbox/entities/inbox-user.entity';
import { ChatStatus } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { Assistance } from './assistance.entity';

export interface ChannelRoomAttributes {
  id: number;
  externalChannelRoomId: string;
  inboxId: number;
  userId?: number;
  citizenId?: number;
  botReplies: boolean;
  status: ChatStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  count?:number
}

export type ChannelRoomCreationAttributes = Optional<
  ChannelRoomAttributes,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Table({
  tableName: 'channelRooms',
  timestamps: true,
  paranoid: true
})
export class ChannelRoom extends Model<ChannelRoomAttributes, ChannelRoomCreationAttributes> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Inbox)
  @Column({
    field: 'inboxId',
    type: DataType.INTEGER,
    allowNull: false,
  })
  inboxId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'userId',
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @Column({
    field: 'externalChannelRoomId',
    type: DataType.STRING,
    allowNull: false,
    unique: false,
    comment: 'Channel-specific ChannelRoom ID (e.g., Telegram chatId)',
  })
  externalChannelRoomId: string;

  @ForeignKey(() => Citizen)
  @Column({
    field: 'citizenId',
    type: DataType.INTEGER,
    allowNull: false,
  })
  citizenId: number;

  @Column({
    field: 'status',
    type: DataType.ENUM('pendiente', 'prioridad', 'completado'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'ChannelRoom status',
  })
  status: ChatStatus;

  @Column({
    field: 'botReplies',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'ChannelRoom bot status',
  })
  botReplies: boolean;

  @Column({
    field: 'createdAt',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
    field: 'updatedAt',
    type: DataType.DATE,
  })
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;

  @BelongsTo(() => Citizen,  { foreignKey: 'citizenId' })
  citizen: Citizen;

  @BelongsTo(() => User,  { foreignKey: 'userId' })
  user: User;

  @BelongsTo(() => Inbox,  { foreignKey: 'inboxId' })
  inbox: Inbox;

  @HasMany(() => ChannelMessage)
  messages: ChannelMessage[];

  @HasMany(() => Assistance)
  assistances: Assistance[];
}
