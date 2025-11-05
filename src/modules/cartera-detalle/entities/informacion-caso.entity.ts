import { CarteraDetalle } from '@modules/cartera-detalle/entities/cartera-detalle.entity';
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
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'informacion_caso',
  timestamps: true,
  paranoid: true,
})
export class InformacionCaso extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'fechaCompromiso',
    type: DataType.DATE,
    allowNull: true,
    comment: 'Fecha del compromiso de pago',
  })
  fechaCompromiso: Date;

  @Column({
    field: 'montoCompromiso',
    type: DataType.FLOAT,
    allowNull: true,
    comment: 'Monto del compromiso de pago',
  })
  montoCompromiso: number;

  @Column({
    field: 'observacion',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Observaciones generales',
  })
  observacion: string;

  @Column({
    field: 'seguimiento',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Seguimiento',
  })
  seguimiento: string;

  @ForeignKey(() => CarteraDetalle)
  @Column({
    field: 'idCarteraDetalle',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id cartera detalle de la atención',
  })
  idCarteraDetalle: number;

  @BelongsTo(() => CarteraDetalle)
  carteraDetalle: CarteraDetalle;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
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
