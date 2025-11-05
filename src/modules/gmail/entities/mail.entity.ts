import { BelongsTo, Column, CreatedAt, DataType, DefaultScope, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { MailAttention } from "./mail-attention.entity";
import { User } from "@modules/user/entities/user.entity";
import { MailState } from "./mail-state.entity";
import { MailType } from "../enum/mail-type.enum";
@DefaultScope(() => ({
    attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
    tableName: 'mails',
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class Mail extends Model {
    @Column({
        field: 'id',
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;
    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    subject: string;
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content: string;
    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    from: string;
    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    to: string;
    @ForeignKey(() => MailAttention)
    @Column({
        field: 'mail_attention_id',
        type: DataType.INTEGER,
        allowNull: false,
        comment: 'Id Estado de atencion asignado al ticket',
    })
    mailAttentionId: number;
    @BelongsTo(() => MailAttention)
    mailAttention: MailAttention;

    /*@ForeignKey(() => MailThread)
    @Column({
        field: 'parent_id',
        type: DataType.INTEGER,
        allowNull: true,
        comment: 'Id Estado de atencion asignado al ticket',
    })
    parentId?: number | null;
    @BelongsTo(() => MailThread)
    parent: MailThread;*/

    @Column({
        field: 'in_reply_to',
        type: DataType.STRING,
        allowNull: true,
    })
    inReplyTo?:string|null;
    @Column({
        field: 'references_mail',
        type: DataType.STRING,
        allowNull: true,
    })
    referencesMail?:string|null;
    @Column({
        field: 'type',
        type: DataType.STRING,
        allowNull: false,
    })
    type:MailType


    @ForeignKey(() => MailState)
    @Column({
        field: 'mail_state_id',
        type: DataType.INTEGER,
        allowNull: false,
        comment: 'Id Estado de Correo',
    })
    mailStateId:number;
    @BelongsTo(() => MailState)
    mailState: MailState;
    @Column({
        field: 'is_favorite',
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    isFavorite:boolean;
    @Column({
        field: 'is_read',
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    isRead:boolean;
    @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'message_gmail_id'
     })
    messageGmailId:string;
    @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'message_header_gmail_id'
     })
    messageHeaderGmailId:string;











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
