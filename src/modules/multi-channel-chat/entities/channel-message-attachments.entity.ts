import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  DefaultScope,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ChannelMessage } from './channel-message.entity';

export interface ChannelMessageAttachmentAttributes {
  id: number;
  channelMessageId: number;
  content: string;
  name: string;
  extension: string;
  size: number;
  type: 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
}

export type ChannelMessageAttachmentCreationAttributes = Optional<
  ChannelMessageAttachmentAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Table({
  tableName: 'channel_message_attachments', // 👈 en BD con snake_case
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['channel_message_id'] }
  ],
})
export class ChannelMessageAttachment extends Model<
  ChannelMessageAttachmentAttributes,
  ChannelMessageAttachmentCreationAttributes
> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => ChannelMessage)
  @Column({
    field: 'channel_message_id', // 👈 en BD con snake_case
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelMessageId: number;


  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Citizen name',
  })
  name?: string;


  @Column({
    field: 'content',
    type: DataType.TEXT('long'),
    allowNull: false,
    comment: 'File encoded in base64',
  })
  content: string;

  @Column({
    field: 'extension',
    type: DataType.STRING(10),
    allowNull: false,
    comment: 'File extension (png, jpg, pdf...)',
  })
  extension: string;

  @Column({
    field: 'size',
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'File size in bytes',
  })
  size: number;

  @Column({
    field: 'type',
    type: DataType.ENUM('file', 'image'),
    allowNull: true,
    comment: 'File type: image or generic file',
  })
  type?: 'file' | 'image';

  @Column({
    field: 'created_at',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
    field: 'updated_at',
    type: DataType.DATE,
  })
  declare updatedAt: Date;

  @BelongsTo(() => ChannelMessage)
  channelMessage: ChannelMessage;
}
