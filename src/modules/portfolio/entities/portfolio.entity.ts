import { Office } from '@modules/office/entities/office.entity';
import { PortfolioDetail } from '@modules/portfolio-detail/entities/portfolio-detail.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  Table,
  Column,
  Model,
  DataType,
  DeletedAt,
  DefaultScope,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  HasMany,
  Scopes,
} from 'sequelize-typescript';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'portfolios',
  timestamps: true,
  paranoid: true,
})
export class Portfolio extends Model {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la carpeta',
  })
  declare id: number;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre de la carpeta',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.TEXT('long'),
    allowNull: true,
    comment: 'Descripción de la carpeta',
  })
  description?: string;

  @Column({
    field: 'date_start',
    type: DataType.DATE,
    allowNull: false,
    comment: 'Fecha de inicio',
  })
  dateStart: Date;

  @Column({
    field: 'date_end',
    type: DataType.DATE,
    allowNull: false,
    comment: 'Fecha de fin',
  })
  dateEnd: Date;

  @Column({
    field: 'amount',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto',
  })
  amount: number;

  @ForeignKey(() => Office)
  @Column({
    field: 'office_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id de la oficina asignada al usuario',
  })
  officeId: number;

  @BelongsTo(() => Office)
  office: Office;

  @HasMany(() => PortfolioDetail)
  detalles: PortfolioDetail[];

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
