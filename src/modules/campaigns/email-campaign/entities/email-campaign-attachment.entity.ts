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
import { EmailCampaignDetail } from './email-campaign-detail.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'email_campaign_attachments',
  timestamps: true,
  paranoid: true,
})
export class EmailCampaignAttachment extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => EmailCampaignDetail)
  @Column({ field: 'email_campaign_detail_id', allowNull: false })
  emailCampaignDetailId: number;

  @Column({
    field: 'filename',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre del archivo',
  })
  filename: string;

  @Column({
    field: 'mime_type',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Código de tipo de archivo',
  })
  mimeType: number;

  @Column({
    field: 'order',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Orden del adjunto',
  })
  order: number;

  @Column({
    field: 'public_url',
    type: DataType.TEXT('long'),
    allowNull: false,
    comment: 'Ruta del archivo adjunto',
  })
  publicUrl: string;

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
