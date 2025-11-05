import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  HasMany,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

export interface EstadoAtencionAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: boolean;
  color?: string;
  deletedAt?: Date;
}

export type EstadoAtencionCreationAttributes = Optional<
  EstadoAtencionAttributes,
  'id' | 'nombre' | 'descripcion' | 'tipo' | 'color' | 'deletedAt'
>; 

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'estado-atencion',
  timestamps: true,
  paranoid: true,
})

export class EstadoAtencion extends Model<EstadoAtencionAttributes, EstadoAtencionCreationAttributes> {
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

  @DeletedAt
  declare deletedAt: Date;
}
