import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

export interface TagsAttributes {
  id: number;
  name: string;
  description?: string;
  color: string;
  inmutable: boolean;
  status?: boolean;
  deletedAt?: Date;
}

export type TagsCreationAttributes = Optional<
  TagsAttributes,
  'id' | 'description' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'tags',
  timestamps: true,
  paranoid: true,
})

export class Tags extends Model<TagsAttributes, TagsCreationAttributes>{
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
    comment: 'Nombre',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.STRING,
    allowNull: true,
    comment: 'descripcion',
  })
  description: string;

  @Column({
    field: 'color',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Color',
  })
  color: string;

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

  @DeletedAt
  declare deletedAt: Date;
}
