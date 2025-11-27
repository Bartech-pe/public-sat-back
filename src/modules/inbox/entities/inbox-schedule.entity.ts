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
  tableName: 'inbox_schedules',
  timestamps: true,
  paranoid: true,
})
export class InboxSchedule extends Model {
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
    field: 'interval_days',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Intervalo de días en formato 0-6',
  })
  intervalDays: string;

  @Column({
    field: 'start_time',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Hora de inicio HH:mm',
  })
  startTime: string;

  @Column({
    field: 'end_time',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Hora de fin HH:mm',
  })
  endTime: string;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

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
