// src/models/cartera.model.ts
import { CarteraDetalle } from '@modules/cartera-detalle/entities/cartera-detalle.entity';
import { Oficina } from '@modules/oficina/entities/oficina.entity';
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
} from 'sequelize-typescript';

@DefaultScope(() => ({
  attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
}))
@Table({ tableName: 'carteras', timestamps: true })
export class Cartera extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  status: boolean;

  @Column({ type: DataType.DATE, allowNull: false })
  dateStart: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  dateEnd: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  amount: number;

  @ForeignKey(() => Oficina)
  @Column({
    field: 'idOficina',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'id Oficina asignada al usuario',
  })
  idOficina: number;

  @BelongsTo(() => Oficina)
  oficina: Oficina;

  @HasMany(() => CarteraDetalle)
  detalles: CarteraDetalle[];

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
