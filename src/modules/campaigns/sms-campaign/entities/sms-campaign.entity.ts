import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] },
}))
@Table({
  tableName: 'sms_campaigns',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class SmsCampaign extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre del campaña',
  })
  name: string;

  @Column({
    field: 'total_registered',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'total registro',
  })
  totalRegistered: number;

  @Column({
    field: 'campaign_status',
    type: DataType.SMALLINT,
    allowNull: false,
    comment: '1:Aprobado 2:pediente 3:finalizado',
  })
  campaignStatus: number;

  @ForeignKey(() => User)
  @Column({ field: 'created_by', allowNull: true })
  createdBy?: number;

  @BelongsTo(() => User, 'createdBy')
  createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updated_by', allowNull: true })
  updatedBy?: number;

  @BelongsTo(() => User, 'updatedBy')
  updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deleted_by', allowNull: true })
  deletedBy?: number;

  @BelongsTo(() => User, 'deletedBy')
  deletedByUser?: User;

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
