import { Cartera } from '@modules/carteras/entities/cartera.entity';
import { User } from '@modules/user/entities/user.entity';
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
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { InformacionCaso } from './informacion-caso.entity';
import { AtencionCiudadano } from '@modules/atencion-ciudadano/entities/atencion-ciudadano.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Scopes(() => ({}))
@Table({
  tableName: 'cartera-detalle',
  timestamps: true,
  paranoid: true,
})
export class CarteraDetalle extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => Cartera)
  @Column({ type: DataType.INTEGER, allowNull: false })
  idCartera: number;

  @BelongsTo(() => Cartera)
  cartera: Cartera;

  @ForeignKey(() => User)
  @Column({ field: 'idUser', allowNull: false })
  idUser: number;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.STRING, allowNull: true })
  segmento: string;

  @Column({ type: DataType.STRING, allowNull: true })
  perfil: string;

  @Column({ type: DataType.STRING, allowNull: true })
  contribuyente: string;

  @Column({
    field: 'tipoContribuyente',
    type: DataType.STRING,
    allowNull: true,
  })
  tipoContribuyente?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  codigo: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  deuda: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  pago: number;

  @Column({ type: DataType.DATE, allowNull: true })
  fecha: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  telefono1?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telefono2?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telefono3?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telefono4?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  whatsapp: string;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @HasOne(() => InformacionCaso)
  informacionCaso: InformacionCaso;

  @HasMany(() => AtencionCiudadano)
  atenciones: AtencionCiudadano[];

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
