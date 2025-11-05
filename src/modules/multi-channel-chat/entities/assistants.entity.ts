import { Optional } from "sequelize";
import { BelongsTo, Column, DataType, DefaultScope, DeletedAt, HasMany, Model, Table } from "sequelize-typescript";
import { ChannelMessage } from "./channel-message.entity";

export interface AssistantsAttributes {
  id: number;
  status: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type AssistantsCreationAttributes = Optional<
  AssistantsAttributes,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Table({
  tableName: 'assistants',
  timestamps: true,
  paranoid: true
})
export class Assistants extends Model<AssistantsAttributes, AssistantsCreationAttributes> {
  @Column({
	field: 'id',
	type: DataType.INTEGER,
	autoIncrement: true,
	primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'status',
    allowNull: false,
    comment: 'Assistant conversation status',
  })
  status: boolean;

  @Column({
	field: 'startDate',
	type: DataType.DATE,
	defaultValue: DataType.NOW,
  })
  declare startDate: Date;

  @Column({
	field: 'endDate',
	type: DataType.DATE,
	defaultValue: DataType.NOW,
  })
  declare endDate: Date;

  @HasMany(() => ChannelMessage)
  messages: ChannelMessage[];

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


}