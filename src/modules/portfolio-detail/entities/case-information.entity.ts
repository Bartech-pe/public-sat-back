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
import { PortfolioDetail } from './portfolio-detail.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'case_informations',
  timestamps: true,
  paranoid: true,
})
export class CaseInformation extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'commitment_date',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Fecha del compromiso de pago',
  })
  commitmentDate: Date;

  @Column({
    field: 'commitment_amount',
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto del compromiso de pago',
  })
  commitmentAmount: number;

  @Column({
    field: 'observation',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Observaciones generales',
  })
  observation: string;

  @Column({
    field: 'follow_up',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Seguimiento',
  })
  followUp: string;

  @ForeignKey(() => PortfolioDetail)
  @Column({
    field: 'portfolio_detail_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id cartera detalle de la atención',
  })
  portfolioDetailId: number;

  @BelongsTo(() => PortfolioDetail)
  portfolioDetail: PortfolioDetail;

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
