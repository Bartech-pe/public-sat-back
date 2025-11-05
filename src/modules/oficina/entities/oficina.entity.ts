import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Area } from '@modules/area/entities/area.entity';
import { User } from '@modules/user/entities/user.entity';

export interface OficinaAttributes {
  id: number;
  name: string;
  description?: string;
  idArea: number;
  inmutable: boolean;
  status?: boolean;
  deletedAt?: Date;
}

export type OficinaCreationAttributes = Optional<
  OficinaAttributes,
  'id' | 'description' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'oficinas',
  timestamps: true,
  paranoid: true,
})
export class Oficina extends Model {
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
    comment: 'Nombre del oficina',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Descripción del oficina',
  })
  description: string;

  @ForeignKey(() => Area)
  @Column({
    field: 'idArea',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'id Área asignado al usuario',
  })
  idArea: number;

  @BelongsTo(() => Area)
  area: Area;

  @Column({
    field: 'inmutable',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Campo para habilitar o inhabilitar la edición de un registro',
  })
  inmutable: boolean;

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
