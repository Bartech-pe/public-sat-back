import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ChannelRoom } from './channel-room.entity';
import { CitizenDocType } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { User } from '@modules/user/entities/user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deleted_at', 'deleted_by'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'channel_citizens',
  timestamps: true,
  paranoid: true,
})
export class ChannelCitizen extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'external_user_id',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Citizen externalUserId',
  })
  externalUserId?: string;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Citizen name',
  })
  name: string;

  @Column({
    field: 'full_name',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Citizen fullname',
  })
  fullName?: string | null;

  @Column({
    field: 'is_external',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Citizen created from non channel or external chat',
  })
  isExternal: boolean;

  @Column({
    field: 'phone_number',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Citizen phoneNumber number',
  })
  phoneNumber?: string;

  @Column({
    field: 'document_number',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Número de documento de identidad del ciudadano',
  })
  documentNumber?: string | null;

  @Column({
    field: 'document_type',
    type: DataType.ENUM('DNI', 'CE', 'OTRO'),
    allowNull: true,
    comment: 'Tipo de documento de identidad del ciudadano',
  })
  documentType?: CitizenDocType | null;

  @Column({
    field: 'email',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Citizen email',
  })
  email?: string;

  @Column({
    field: 'avatar_url',
    type: DataType.STRING,
    allowNull: true,
    comment: 'URL to Citizen avatar',
  })
  avatarUrl?: string;

  @HasMany(() => ChannelRoom)
  channelRooms: ChannelRoom[];

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
