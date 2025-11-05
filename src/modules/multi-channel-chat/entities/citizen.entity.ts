import {
  AllowNull,
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ChannelRoom } from './channel-room.entity';
import { ChannelMessage } from './channel-message.entity';
import { CitizenDocType } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';

export interface CitizenAttributes {
  id: number;
  externalUserId?: string;
  name: string;
  fullName?: string;
  phoneNumber?: string;
  documentNumber?: string,
  documentType?: CitizenDocType,
  email?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type CitizenCreationAttributes = Optional<
  CitizenAttributes,
  'id' | 'externalUserId' | 'name' | 'fullName' | 'phoneNumber' | 'documentNumber' | 'documentType' | 'email' | 'avatarUrl' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Table({
  tableName: 'citizens',
  timestamps: true,
  paranoid: true,
})
export class Citizen extends Model<CitizenAttributes, CitizenCreationAttributes> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'externalUserId',
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
    field: 'fullName',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Citizen fullname',
  })
  fullName?: string | null;

  @Column({
    field: 'isExternal',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Citizen created from non channel or external chat',
  })
  isExternal: boolean;

  @Column({
    field: 'phoneNumber',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Citizen phoneNumber number',
  })
  phoneNumber?: string;

  @Column({
    field: 'documentNumber',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Número de documento de identidad del ciudadano',
  })
  documentNumber?: string | null;

  @Column({
    field: 'documentType',
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
    field: 'avatarUrl',
    type: DataType.STRING,
    allowNull: true,
    comment: 'URL to Citizen avatar',
  })
  avatarUrl?: string;

  @HasMany(() => ChannelRoom)
  channelRooms: ChannelRoom[];

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
}