import { Optional } from 'sequelize';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ChannelMessage } from './channel-message.entity';
import { ChannelRoom } from './channel-room.entity';
import { User } from '@modules/user/entities/user.entity';
import { ConsultType } from '@modules/consult-type/entities/consult-type.entity';

export enum ChannelAttentionStatus {
  IDENTITY_VERIFICATION = 'identity_verification',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@DefaultScope(() => ({
  attributes: { exclude: ['deleted_at', 'deleted_by'] }, // Excluir campo de eliminación lógica
}))
@Table({
  tableName: 'channel_attentions',
  timestamps: true,
  paranoid: true,
})
export class ChannelAttention extends Model<ChannelAttention> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => ChannelRoom)
  @Column({
    field: 'channel_room_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelRoomId: number;

  @ForeignKey(() => ConsultType)
  @Column({
    field: 'consult_type_id',
    type: DataType.INTEGER,
    allowNull: true
  })
  consultTypeId?: number;

  @Column({
    field: 'status',
    type: DataType.ENUM(...Object.values(ChannelAttentionStatus)),
    allowNull: false,
    defaultValue: ChannelAttentionStatus.IDENTITY_VERIFICATION,
    comment: 'Assistance conversation status',
  })
  declare status: ChannelAttentionStatus;

  @Column({
    field: 'start_date',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare startDate: Date;

  @Column({
    field: 'end_date',
    allowNull: true,
    type: DataType.DATE,
  })
  declare endDate?: Date | null;

  @HasMany(() => ChannelMessage)
  messages: ChannelMessage[];

  @BelongsTo(() => ChannelRoom)
  channelRoom: ChannelRoom;

  @BelongsTo(() => ConsultType)
  consultType: ConsultType;

  @ForeignKey(() => User)
  @Column({ field: 'created_by', allowNull: true })
  declare createdBy: number;

  @BelongsTo(() => User, 'created_by')
  declare createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updated_by', allowNull: true })
  declare updatedBy: number;

  @BelongsTo(() => User, 'updated_by')
  declare updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deleted_by', allowNull: true })
  declare deletedBy: number;

  @BelongsTo(() => User, 'deleted_by')
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
