import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ChannelState } from '@modules/custom-states/channel-state/entities/channel-state.entity';
import { User } from '@modules/user/entities/user.entity';
import { Inbox } from './inbox.entity';

@Table({ tableName: 'channel_state_user_history', timestamps: false })
export class ChannelStateUserHistory extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.BIGINT,
    allowNull: false,
  })
  userId: number;

  @ForeignKey(() => Inbox)
  @Column({
    field: 'inbox_id',
    type: DataType.BIGINT,
    allowNull: false,
  })
  inboxId: number;

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

  @Column({ field: 'start_time', type: DataType.DATE, allowNull: true })
  startTime: Date;

  @Column({ field: 'end_time', type: DataType.DATE, allowNull: true })
  endTime: Date;

  @Column({ field: 'duration', type: DataType.INTEGER, allowNull: true })
  duration: number;

  // Relaciones opcionales (para eager loading)
  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Inbox)
  inbox: Inbox;

  @BelongsTo(() => ChannelState, 'oldChannelStateId')
  oldChannelState: ChannelState;

  @BelongsTo(() => ChannelState, 'newChannelStateId')
  newChannelState: ChannelState;
}
