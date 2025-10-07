import { User } from '@modules/user/entities/user.entity';
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

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'channel_schedules',
  timestamps: true,
  paranoid: true,
})
export class ChannelSchedule extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'month',
    type: DataType.DATE,
    allowNull: false,
    comment: 'Month for the schedule assignment',
  })
  month: Date;

  @Column({
    field: 'channel_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID of the channel',
  })
  channelId: number;

  // @Column({
  //   field: 'days',
  //   type: DataType.JSON,
  //   allowNull: false,
  //   comment: 'Array of schedule days with start and end times',
  //   get() {
  //     const days = this.getDataValue('days');
  //     return days ? JSON.parse(days) : [];
  //   },
  //   set(value: DaySchedule[]) {
  //     this.setDataValue('days', JSON.stringify(value));
  //   },
  // })
  // days: DaySchedule[];

  @Column({
    field: 'days',
    type: DataType.JSON,
    allowNull: false,
    comment: 'Array of schedule days with start and end times',
  })
  days: string[];

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Field to enable or disable a record',
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
