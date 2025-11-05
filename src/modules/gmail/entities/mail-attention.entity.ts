import { BelongsTo, Column, CreatedAt, DataType, DefaultScope, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { EstadoAtencion } from "@modules/estado-atencion/entities/estado-atencion.entity";
import { User } from "@modules/user/entities/user.entity";
import { InboxUser } from "@modules/inbox/entities/inbox-user.entity";


@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'mailAttentions',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class MailAttention extends Model {
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
    field: 'email_citizen'
  })
  emailCitizen: string;





  @ForeignKey(() => InboxUser)
  @Column({
    field: 'advisor_user_id',
    type: DataType.INTEGER,
    allowNull: true,
  })
  advisorUserId?: number;
  @ForeignKey(() => InboxUser)
  @Column({
    field: 'advisor_inbox_id',
    type: DataType.INTEGER,
    allowNull: true,
  })
  advisorInboxId?: number;




  @ForeignKey(() => EstadoAtencion)
  @Column({
    field: 'state_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id Estado de atencion asignado al ticket',
  })
  stateId: number;
  @BelongsTo(() => EstadoAtencion)
  state: EstadoAtencion;
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'ticket_code'
  })
  ticketCode: string;
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'thread_gmail_id'
  })
  threadGmailId:string

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'closed_at'
  })
  declare closedAt: Date;



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
