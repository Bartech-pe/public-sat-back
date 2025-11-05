import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { CampaignEmail } from './campaign-email.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))

@Table({
  tableName: 'email_attachments_campaigns',
  timestamps: true,
  paranoid: true,
})
export class EmailAttachment extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => CampaignEmail)
  @Column({ field: 'campaign_email_id', allowNull: false })
  declare campaignEmailId: number;

  @Column({
    field: 'file_name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre del archivo',
  })
  declare fileName: string;

  @Column({
    field: 'file_type_code',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Código de tipo de archivo',
  })
  declare fileTypeCode: number;

  @Column({
    field: 'order',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Orden del adjunto',
  })
  declare order: number;

  @Column({
    field: 'base64',
    type: DataType.TEXT('long'),
    allowNull: false,
    comment: 'Contenido en Base64',
  })
  declare base64: string;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

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