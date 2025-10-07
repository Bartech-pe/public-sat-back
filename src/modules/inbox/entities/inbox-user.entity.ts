import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  BelongsTo,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { Inbox } from './inbox.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';

@Table({
  tableName: 'inbox_users',
  timestamps: true,
  paranoid: true,
})
export class InboxUser extends Model {
  @ForeignKey(() => Inbox)
  @Column({
    field: 'inbox_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id del equipo',
  })
  inboxId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id del usuario',
  })
  userId: number;

  @BelongsTo(() => User, { foreignKey: 'userId' })
  user: User;

  @BelongsTo(() => Inbox, { foreignKey: 'inboxId' })
  inbox: Inbox;

  @ForeignKey(() => ChannelState)
  @Column({
    field: 'channel_state_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id Estado de canal asignado al asesor',
  })
  channelStateId?: number;

  @BelongsTo(() => ChannelState)
  channelState: ChannelState;

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
