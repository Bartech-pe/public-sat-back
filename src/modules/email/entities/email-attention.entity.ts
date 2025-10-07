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
import { User } from '@modules/user/entities/user.entity';
import { AssistanceState } from '@modules/assistance-state/entities/assistance-state.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'email_attentions',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class EmailAttention extends Model {
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
    field: 'email_citizen',
  })
  emailCitizen: string;

  @ForeignKey(() => User)
  @Column({
    field: 'advisor_user_id',
    type: DataType.INTEGER,
    allowNull: true,
  })
  advisorUserId?: number;

  @BelongsTo(() => User)
  advisor: User;

  @ForeignKey(() => Inbox)
  @Column({
    field: 'advisor_inbox_id',
    type: DataType.INTEGER,
    allowNull: true,
  })
  advisorInboxId?: number;

  @BelongsTo(() => Inbox)
  inbox: Inbox;

  @ForeignKey(() => AssistanceState)
  @Column({
    field: 'assistance_state_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id Estado de atencion asignado al ticket',
  })
  assistanceStateId: number;

  @BelongsTo(() => AssistanceState)
  assistanceState: AssistanceState;

  @Column({
    field: 'ticket_code',
    type: DataType.STRING(255),
    allowNull: false,
  })
  ticketCode: string;

  @Column({
    field: 'email_thread_id',
    type: DataType.STRING(255),
    allowNull: false,
  })
  mailThreadId: string;

  @Column({
    field: 'closed_at',
    type: DataType.DATE,
    allowNull: true,
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
