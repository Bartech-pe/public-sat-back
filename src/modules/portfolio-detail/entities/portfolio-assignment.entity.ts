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
import { PortfolioDetail } from '@modules/portfolio-detail/entities/portfolio-detail.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'portfolio_assignments',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class PortfolioAssignment extends Model {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la asignación de cartera',
  })
  declare id: number;

  @ForeignKey(() => PortfolioDetail)
  @Column({
    field: 'portfolio_detail_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Detalle de cartera (relación con PortfolioDetail)',
  })
  portfolioDetailId: number;

  @BelongsTo(() => PortfolioDetail)
  portfolioDetail: PortfolioDetail;

  @ForeignKey(() => User)
  @Column({
    field: 'user_prev_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del usuario anterior asignado',
  })
  userPrevId: number;

  @BelongsTo(() => User, 'userPrevId')
  userPrev: User;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Id del usuario actual asignado',
  })
  userId: number;

  @BelongsTo(() => User, 'userId')
  user: User;

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
