import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ChannelRoom } from './channel-room.entity';
import { MessageStatus } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { Assistance } from './assistance.entity';
import { User } from '@modules/user/entities/user.entity';
import { ChannelMessageAttachment } from './channel-message-attachments.entity';

export interface ChannelMessageAttributes {
  id: number;
  content: string;
  status: MessageStatus;
  channelRoomId: number;
  userId: number;
  externalMessageId: string;
  senderType: 'agent' | 'citizen' | 'bot';
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type ChannelMessageCreationAttributes = Optional<
  ChannelMessageAttributes,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Table({
  tableName: 'ChannelMessages',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['channelRoomId'] }
  ],
})
export class ChannelMessage extends Model<ChannelMessageAttributes, ChannelMessageCreationAttributes> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => ChannelRoom)
  @Column({
    field: 'channelRoomId',
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelRoomId: number;

  @ForeignKey(() => Assistance)
  @Column({
    field: 'assistanceId',
    type: DataType.INTEGER,
    allowNull: false,
  })
  assistanceId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'userId',
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @Column({
    field: 'content',
    type: DataType.TEXT,
    allowNull: false,
    comment: 'ChannelMessage content',
  })
  content: string;

  @Column({
    field: 'externalMessageId',
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
    field: 'senderType',
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

  @BelongsTo(() => ChannelRoom)
  channelRoom: ChannelRoom;

  @HasMany(() => ChannelMessageAttachment)
  attachments: ChannelMessageAttachment[];

  @BelongsTo(() => User)
  user: User;
  
  @BelongsTo(() => Assistance)
  assistances: Assistance;

}