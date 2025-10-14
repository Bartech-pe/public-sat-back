import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  DeletedAt,
  DefaultScope,
  Scopes,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { User } from '@modules/user/entities/user.entity';
import { CampaignType } from '@modules/campaign-type/entities/campaign-type.entity';
import { CampaignState } from '@modules/campaign-state/entities/campaign-state.entity';
import { Department } from '@modules/department/entities/department.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] },
}))
@Scopes(() => ({}))
@Table({
  tableName: 'campaigns',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Campaign extends Model {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la campaña',
  })
  declare id: number;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Nombre de la campaña',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Descripción de la campaña',
  })
  description: string;

  @ForeignKey(() => CampaignType)
  @Column({
    field: 'campaign_type_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Tipo de campaña (relación con CampaignType)',
  })
  campaignTypeId: number;

  @BelongsTo(() => CampaignType)
  campaignType: CampaignType;

  @ForeignKey(() => Department)
  @Column({
    field: 'department_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'ID del área asignada a la campaña',
  })
  departmentId: number;

  @BelongsTo(() => Department)
  department: Department;

  @ForeignKey(() => CampaignState)
  @Column({
    field: 'campaign_state_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Estado actual de la campaña (relación con CampaignState)',
  })
  campaignStateId: number;

  @BelongsTo(() => CampaignState)
  campaignState: CampaignState;

  @Column({
    field: 'start_date',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Fecha de inicio de la campaña',
  })
  startDate: Date;

  @Column({
    field: 'end_date',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Fecha de finalización de la campaña',
  })
  endDate: Date;

  @Column({
    field: 'start_time',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Hora de inicio de la campaña',
  })
  startTime: Date;

  @Column({
    field: 'end_time',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Hora de fin de la campaña',
  })
  endTime: Date;

  @Column({
    field: 'start_day',
    type: DataType.SMALLINT,
    allowNull: true,
    comment: 'Día de la semana de inicio de la campaña',
  })
  startDay: number;

  @Column({
    field: 'end_day',
    type: DataType.SMALLINT,
    allowNull: true,
    comment: 'Día de la semana de fin de la campaña',
  })
  endDay: number;

  @Column({
    field: 'apply_holiday',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Aplicar campaña en días feriados',
  })
  applyHoliday?: boolean;

  @Column({
    field: 'valid_until',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Fecha de vigencia de la campaña',
  })
  validUntil: Date;

  @Column({
    field: 'vd_campaign_id',
    type: DataType.INTEGER, // 👈 cambia STRING por INTEGER
    allowNull: true,
    comment: 'Identificador de la campaña en un sistema externo (VD)',
  })
  vdCampaignId?: number;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

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
