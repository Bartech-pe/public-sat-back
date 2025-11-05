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

type DaySchedule = {
  startTime: string;
  endTime: string;
};

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Scopes(() => ({}))
@Table({
  tableName: 'schedule_assignments',
  timestamps: true,
  paranoid: true,
})
export class ScheduleAssignment extends Model {
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
    field: 'id_chanel',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID of the channel',
  })
  idChanel: number;

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
    allowNull: false,
    comment: 'Array of schedule days with start and end times',
  })
  days: string;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Field to enable or disable a record',
  })
  status: boolean;

  @ForeignKey(() => User)
  @Column({ field: 'createdBy', allowNull: true })
  declare createdBy: number;

  @BelongsTo(() => User, 'createdBy')
  declare createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updatedBy', allowNull: true })
  declare updatedBy: number;

  @BelongsTo(() => User, 'updatedBy')
  declare updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deletedBy', allowNull: true })
  declare deletedBy: number;

  @BelongsTo(() => User, 'deletedBy')
  declare deletedByUser?: User;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
