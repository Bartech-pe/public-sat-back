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
} from 'sequelize-typescript';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { User } from '@modules/user/entities/user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'inbox_credentials',
  timestamps: true,
  paranoid: true,
})
export class InboxCredential extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Inbox)
  @Column({
    field: 'inbox_id',
    type: DataType.BIGINT,
    allowNull: false,
  })
  inboxId: number;

  @Column({
    field: 'access_token',
    type: DataType.STRING,
    allowNull: true,
    comment: 'API key for channel integration',
  })
  accessToken?: string;

  @Column({
    field: 'phone_number_id',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Phone number ID for Whatsapp Business',
  })
  phoneNumberId?: string;

  @Column({
    field: 'business_id',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Whatsapp Business ID ',
  })
  businessId?: string;

  @Column({
    field: 'phone_number',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Phone number for channels like WhatsApp, SMS',
  })
  phoneNumber?: string;

  @Column({
    field: 'expires_at',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Token expiration time',
  })
  expiresAt?: Date;

  @BelongsTo(() => Inbox, { foreignKey: 'inboxId' })
  inbox: Inbox;

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
