import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Inbox } from '@modules/inbox/entities/inbox.entity';

export interface InboxCredentialAttributes {
  id: number;
  inboxId: number;
  apiKey?: string;
  phoneNumber?: string;
  accessToken?: string;
  phoneNumberId?: string;
  businessId?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type InboxCredentialCreationAttributes = Optional<
  InboxCredentialAttributes,
  'id' | 'inboxId' | 'apiKey' | 'phoneNumber' | 'accessToken' | 'phoneNumberId' | 'businessId' | 'expiresAt' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedat'] },
}))
@Table({
  tableName: 'InboxCredentials',
  timestamps: true,
  paranoid: true,
})
export class InboxCredential extends Model<InboxCredentialAttributes, InboxCredentialCreationAttributes> {
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

  @Column({
    field: 'accessToken',
    type: DataType.STRING,
    allowNull: true,
    comment: 'API key for channel integration',
  })
  accessToken?: string;

  @Column({
    field: 'phoneNumberId',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Phone number ID for Whatsapp Business',
  })
  phoneNumberId?: string;
  
  @Column({
    field: 'businessId',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Whatsapp Business ID ',
  })
  businessId?: string;

  @Column({
    field: 'phoneNumber',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Phone number for channels like WhatsApp, SMS',
  })
  phoneNumber?: string;

  @Column({
    field: 'expiresAt',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Token expiration time',
  })
  expiresAt?: Date;

  @Column({
    field: 'createdAt',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;


  @BelongsTo(() => Inbox, { foreignKey: 'inboxId' })
  inbox: Inbox;

  @Column({
    field: 'updatedAt',
    type: DataType.DATE,
  })
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;
}