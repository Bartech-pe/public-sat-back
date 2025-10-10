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
import { User } from './user.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'call_history',
  timestamps: true,
  paranoid: true,
})
export class CallHistory extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ field: 'user_id', allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user?: User;

  @Column({
    field: 'lead_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  leadId: number;

  @Column({
    field: 'caller_id',
    type: DataType.STRING,
    allowNull: false,
  })
  callerId: string;

  @Column({
    field: 'user_code',
    type: DataType.STRING,
    allowNull: false,
  })
  userCode: string;

  @Column({
    field: 'phone_number',
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumber: string;

  @Column({
    field: 'channel',
    type: DataType.STRING,
    allowNull: false,
  })
  channel: number;

  @Column({
    field: 'entry_date',
    type: DataType.DATE,
    allowNull: false,
  })
  entryDate: Date;

  @Column({
    field: 'seconds',
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  seconds: number;

  @Column({
    field: 'call_status',
    type: DataType.STRING,
    allowNull: false,
  })
  callStatus: string;

  @Column({
    field: 'call_basic_info',
    type: DataType.TEXT,
    allowNull: false,
  })
  callBasicInfo: string;

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
