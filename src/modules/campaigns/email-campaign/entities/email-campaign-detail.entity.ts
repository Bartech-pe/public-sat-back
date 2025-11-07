import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  Scopes,
  UpdatedAt,
  DefaultScope,
} from 'sequelize-typescript';
import { EmailCampaign } from './email-campaign.entity';
import { EmailCampaignAttachment } from './email-campaign-attachment.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'email_campaign_details',
  timestamps: true,
  paranoid: true,
})
export class EmailCampaignDetail extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => EmailCampaign)
  @Column({
    field: 'email_campaign_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'id campaña corrreo',
  })
  emailCampaignId: number;

  @BelongsTo(() => EmailCampaign)
  emailCampaign: EmailCampaign;

  @Column({
    field: 'process_code',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Código del proceso',
  })
  declare processCode: number;

  @Column({
    field: 'sender_code',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Código del remitente',
  })
  declare senderCode: number;

  @Column({
    field: 'to',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Correo destino',
  })
  declare to: string;

  @Column({
    field: 'cc',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Con copia',
  })
  declare cc?: string;

  @Column({
    field: 'bcc',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Con copia oculta',
  })
  declare bcc?: string;

  @Column({
    field: 'subject',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Asunto del correo',
  })
  declare subject: string;

  @Column({
    field: 'message',
    type: DataType.TEXT('long'),
    allowNull: false,
    comment: 'Mensaje del correo',
  })
  declare message: string;

  @Column({
    field: 'document_type_code',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Código del tipo de documento',
  })
  declare documentTypeCode?: number;

  @Column({
    field: 'document_type_value',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Valor del tipo de documento',
  })
  declare documentTypeValue?: string;

  @Column({
    field: 'terminal_name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre del terminal',
  })
  declare terminalName: string;

  @HasMany(() => EmailCampaignAttachment, { foreignKey: 'emailCampaignId' })
  declare attachments?: EmailCampaignAttachment[];

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
