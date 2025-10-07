import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { CallState } from './call-state.entity';
import { User } from '@modules/user/entities/user.entity';

@Table({
  tableName: 'calls',
  paranoid: true,
  timestamps: true,
})
export class Call extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la llamada',
  })
  declare id: number;

  @Column({
    field: 'duration',
    type: DataType.FLOAT,
    allowNull: false,
    comment: 'Duraciòn de la llamada',
  })
  duration: number;

  @Column({
    field: 'recording',
    type: DataType.STRING,
    allowNull: true,
  })
  recording: string;

  @Column({
    field: 'phone_number',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nùmero de la llamada entrante',
  })
  phoneNumber: string;

  @Column({
    field: 'channel',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Canal de la llamada entrante',
  })
  channel: string;

  @ForeignKey(() => CallState)
  @Column({
    field: 'call_state_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'ID del estado del canal',
  })
  callStateId: number;

  @BelongsTo(() => CallState, { as: 'callState' })
  callState: CallState;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'ID del usuario',
  })
  userId: number;

  @BelongsTo(() => User, { as: 'advisor', foreignKey: 'userId' })
  advisor: User;

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
