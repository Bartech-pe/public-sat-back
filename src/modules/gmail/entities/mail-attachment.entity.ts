import { User } from "@modules/user/entities/user.entity";
import { BelongsTo, Column, CreatedAt, DataType, DefaultScope, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { Mail } from "./mail.entity";
@DefaultScope(() => ({
    attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
    tableName: 'mailAttachments',
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class MailAttachment extends Model {
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
        field: 'filename'
    })
    filename: string;
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'mime_type'
    })
    mimeType: string;
    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: 'attachment_gmail_id'
    })
    attachmentGmailId: string;
    @ForeignKey(() => Mail)
    @Column({
        field: 'mail_thread_id',
        type: DataType.INTEGER,
        allowNull: true,
        comment: 'Id del hilo de correo del adjunto',
    })
    mailThreadId?: number | null;
    @BelongsTo(() => Mail)
    mailThread: Mail;


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
