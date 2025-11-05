import { Optional } from "sequelize";
import { BelongsTo, Column, DataType, DefaultScope, DeletedAt, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { ChannelMessage } from "./channel-message.entity";
import { ChannelRoom } from "./channel-room.entity";

export interface AssistanceAttributes {
  id: number;
  status: AssistanceStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
   channelRoomId: number;
  channelRoom?: ChannelRoom
  count?:number;
}

export enum AssistanceStatus {
  IDENTITY_VERIFICATION = "identity_verification",
  IN_PROGRESS = "in_progress",
  CLOSED = "closed",
}

export type AssistancereationAttributes = Optional<
  AssistanceAttributes,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Table({
  tableName: 'assistances',
  timestamps: true,
  paranoid: true
})
export class Assistance extends Model<AssistanceAttributes, AssistancereationAttributes> {
  @Column({
	field: 'id',
	type: DataType.INTEGER,
	autoIncrement: true,
	primaryKey: true,
  })
  declare id: number;
  
  @ForeignKey(() => ChannelRoom)
  @Column({
    field: 'channelRoomId',
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelRoomId: number;

  @Column({
    field: "status",
    type: DataType.ENUM(...Object.values(AssistanceStatus)),
    allowNull: false,
    defaultValue: AssistanceStatus.IDENTITY_VERIFICATION,
    comment: "Assistance conversation status",
  })
  declare status: AssistanceStatus;

  @Column({
    field: 'startDate',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare startDate: Date;

  @Column({
    field: 'endDate',
    allowNull: true,
    type: DataType.DATE,
  })
  declare endDate?: Date | null;

  @Column({
	field: 'createdAt',
	type: DataType.DATE,
	defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
	field: 'updatedAt',
	type: DataType.DATE,
  })
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;

  @HasMany(() => ChannelMessage)
  messages: ChannelMessage[];

  @BelongsTo(() => ChannelRoom)
  channelRoom: ChannelRoom;

}