import { Campaign } from '@modules/campaign/entities/campaign.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'schedules',
  paranoid: true,
  timestamps: true,
  underscored: true,
})
export class Schedule extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador del horario',
  })
  declare id: number;

  @Column({
    field: 'start_time',
    type: DataType.DATE,
    allowNull: false,
  })
  startTime: Date;

  @Column({
    field: 'end_time',
    type: DataType.DATE,
    allowNull: false,
  })
  endTime: Date;

  @Column({
    field: 'is_holiday',
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isHoliday: boolean;

  @ForeignKey(() => Campaign)
  @Column({ field: 'campaign_id', type: DataType.INTEGER, allowNull: true })
  campaignId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
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
