import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CallState } from './callState.entity';
import { User } from '@modules/user/entities/user.entity';

@Table({
  tableName: 'call',
  paranoid: true,
  timestamps: true,
})
export class Call extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare callId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  duration: number;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  recording: string;

  @Column({ type: DataType.STRING, allowNull: false })
  phoneNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  channel: string;

  @ForeignKey(() => CallState)
  @Column
  callStateId: number;

  @BelongsTo(() => CallState, { as: 'callState' })
  callState: CallState;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User, { as: 'advisor', foreignKey: 'userId' })
  advisor: User;
}
