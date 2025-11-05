import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { VicidialUser } from './vicidial-user.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';

@Table({ tableName: 'vicidial_user_history', timestamps: false })
export class VicidialUserHistory extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => VicidialUser)
  @Column({
    field: 'vicidial_user_id',
    type: DataType.BIGINT,
    allowNull: false,
  })
  vicidialUserId: number;

  @ForeignKey(() => ChannelState)
  @Column({
    field: 'old_channel_state_id',
    type: DataType.BIGINT,
    allowNull: false,
  })
  oldChannelStateId: number;

  @ForeignKey(() => ChannelState)
  @Column({
    field: 'new_channel_state_id',
    type: DataType.BIGINT,
    allowNull: false,
  })
  newChannelStateId: number;

  @Column({ field: 'old_pause_code', type: DataType.STRING, allowNull: true })
  oldPauseCode: string;

  @Column({ field: 'new_pause_code', type: DataType.STRING, allowNull: true })
  newPauseCode: string;

  @Column({ field: 'start_time', type: DataType.DATE, allowNull: true })
  startTime: Date;

  @Column({ field: 'end_time', type: DataType.DATE, allowNull: true })
  endTime: Date;

  @Column({ field: 'duration', type: DataType.INTEGER, allowNull: true })
  duration: number;

  // Relaciones opcionales (para eager loading)
  @BelongsTo(() => VicidialUser)
  vicidialUser: VicidialUser;

  @BelongsTo(() => ChannelState, 'oldChannelStateId')
  oldChannelState: ChannelState;

  @BelongsTo(() => ChannelState, 'newChannelStateId')
  newChannelState: ChannelState;
}
