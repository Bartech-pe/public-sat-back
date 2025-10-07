import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  DefaultScope,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { ChannelMessage } from './channel-message.entity';
import { User } from '@modules/user/entities/user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deleted_at', 'deleted_by'] },
}))
@Table({
  tableName: 'channel_message_attachments',
  timestamps: true,
  paranoid: true,
  indexes: [{ fields: ['channel_message_id'] }],
})
export class ChannelMessageAttachment extends Model<ChannelMessageAttachment> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => ChannelMessage)
  @Column({
    field: 'channel_message_id', 
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
  type: 'file' | 'image';

  @BelongsTo(() => ChannelMessage)
  channelMessage: ChannelMessage;

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
