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
  HasOne,
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
  tableName: 'atencion_ciudadano',
  timestamps: true,
  paranoid: true,
})
export class AtencionCiudadano extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'metodo',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Metodo de atención',
  })
  metodo: string;

  @Column({
    field: 'tipo',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Tipo de atención',
  })
  tipo: string;

  @Column({
    field: 'canal',
    type: DataType.STRING,
    allowNull: true,
    comment: 'canal de atención',
  })
  canal: string;

  @Column({
    field: 'contacto',
    type: DataType.STRING,
    allowNull: true,
    comment: 'contacto de atención',
  })
  contacto: string;

  @Column({
    field: 'resultado',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Resultado de atención',
  })
  resultado: string;

  @Column({
    field: 'observacion',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Observación de atención',
  })
  observacion: string;

  @Column({
    field: 'docIde',
    type: DataType.STRING,
    allowNull: true,
    comment: 'documento de identificación del ciudadano',
  })
  docIde: string;

  @Column({
    field: 'verifPago',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Campo para marcar si es una verificación de pago',
  })
  verifPago: boolean;

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
