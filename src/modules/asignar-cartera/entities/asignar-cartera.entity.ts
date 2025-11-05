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
import { CarteraDetalle } from '@modules/cartera-detalle/entities/cartera-detalle.entity';
import { User } from '@modules/user/entities/user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Scopes(() => ({}))
@Table({
  tableName: 'asignar_cartera',
  timestamps: true,
  paranoid: true,
})
export class AsignarCartera extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => CarteraDetalle)
  @Column({ type: DataType.INTEGER, allowNull: false })
  idCarteraDetalle: number;

  @BelongsTo(() => CarteraDetalle)
  carteraDetalle: CarteraDetalle;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  idUserPrev: number;

  @BelongsTo(() => User, 'idUserPrev')
  userPrev: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  idUser: number;

  @BelongsTo(() => User, 'idUser')
  user: User;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

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
