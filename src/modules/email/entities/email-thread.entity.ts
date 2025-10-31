import {
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
import { EmailAttention } from './email-attention.entity';
import { User } from '@modules/user/entities/user.entity';
import { MailType } from '../enum/mail-type.enum';
import { EmailState } from './email-state.entity';
import { EmailAttachment } from './email-attachment.entity';
@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'email_threads',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class EmailThread extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'subject',
    type: DataType.STRING(255),
    allowNull: true,
  })
  subject: string;

  @Column({
    field: 'content',
    type: DataType.TEXT('long'),
    allowNull: false,
  })
  content: string;

  @Column({
    field: 'from',
    type: DataType.STRING(255),
    allowNull: true,
  })
  from: string;

  @Column({
    field: 'name',
    type: DataType.STRING(255),
    allowNull: true,
  })
  name: string;

  @Column({
    field: 'to',
    type: DataType.STRING(255),
    allowNull: true,
  })
  to: string;

  @Column({
    field: 'date',
    type: DataType.STRING(255),
    allowNull: true,
  })
  date: string;

  @ForeignKey(() => EmailAttention)
  @Column({
    field: 'email_attention_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id Estado de atencion asignado al ticket',
  })
  mailAttentionId: number;

  @BelongsTo(() => EmailAttention)
  emailAttention: EmailAttention;

  @Column({
    field: 'in_reply_to',
    type: DataType.STRING,
    allowNull: true,
  })
  inReplyTo?: string | null;

  @Column({
    field: 'references_mail',
    type: DataType.TEXT('long'),
    allowNull: true,
  })
  referencesMail?: string | null;

  @Column({
    field: 'type',
    type: DataType.ENUM(...Object.values(MailType)),
    allowNull: false,
  })
  type: MailType;

  @ForeignKey(() => EmailState)
  @Column({
    field: 'email_state_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id Estado de Correo',
  })
  mailStateId: number;

  @BelongsTo(() => EmailState)
  emailState: EmailState;

  @Column({
    field: 'is_favorite',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isFavorite: boolean;

  @Column({
    field: 'is_read',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isRead: boolean;

  @Column({
    field: 'message_gmail_id',
    type: DataType.STRING(255),
    allowNull: false,
  })
  messageGmailId: string;

  @Column({
    field: 'message_header_gmail_id',
    type: DataType.STRING(255),
    allowNull: false,
  })
  messageHeaderGmailId: string;

  @HasMany(() => EmailAttachment)
  attachments: EmailAttachment[];

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
