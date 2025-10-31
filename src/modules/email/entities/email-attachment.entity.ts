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
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { EmailThread } from './email-thread.entity';
@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'email_attachments',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class EmailAttachment extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'filename',
  })
  filename: string;

  @Column({
    field: 'mime_type',
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Tipo de archivo adjunto',
  })
  mimeType: string;

  @Column({
    field: 'attachment_gmail_id',
    type: DataType.TEXT('long'),
    allowNull: false,
    comment: 'ID de Gmail del archivo adjunto',
  })
  attachmentGmailId: string;

  @Column({
    field: 'public_url',
    type: DataType.TEXT('long'),
    allowNull: false,
    comment: 'Ruta del archivo adjunto',
  })
  publicUrl: string;

  @Column({
    field: 'cid',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Content ID del archivo adjunto',
  })
  cid: string;

  @ForeignKey(() => EmailThread)
  @Column({
    field: 'email_thread_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id del hilo de correo del adjunto',
  })
  mailThreadId?: number | null;

  @BelongsTo(() => EmailThread)
  mailThread: EmailThread;

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
