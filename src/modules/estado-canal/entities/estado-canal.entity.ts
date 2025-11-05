import { Optional } from 'sequelize';
import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';

export interface EstadoCanalAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: boolean;
  color?: string;
  categoria?: number;
  deletedAt?: Date;
}

export type EstadoCanalCreationAttributes = Optional<
  EstadoCanalAttributes,
  'id' | 'nombre' | 'descripcion' | 'tipo' | 'color' | 'categoria' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'estado-canal',
  timestamps: true,
  paranoid: true,
})
export class EstadoCanal extends Model<
  EstadoCanalAttributes,
  EstadoCanalCreationAttributes
> {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'nombre',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre del Estado',
  })
  nombre: string;

  @Column({
    field: 'descripcion',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Descripción del Estado',
  })
  descripcion: string;

  @Column({
    field: 'tipo',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Tipo de Estado',
  })
  tipo: boolean;

  @Column({
    field: 'color',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Color de Estado',
  })
  color: string;

  @Column({
    field: 'categoria',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Categoría del Estado',
  })
  categoria: number;


  @DeletedAt
  declare deletedAt: Date;
}
