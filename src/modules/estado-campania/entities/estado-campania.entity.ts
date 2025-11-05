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

export interface EstadoCampaniaAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: boolean;
  color?: string;
  deletedAt?: Date;
}

export type EstadoCampaniaCreationAttributes = Optional<
  EstadoCampaniaAttributes,
  'id' | 'nombre' | 'descripcion' | 'tipo' | 'color' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'estado-campania',
  timestamps: true,
  paranoid: true,
})
export class EstadoCampania extends Model<
  EstadoCampaniaAttributes,
  EstadoCampaniaCreationAttributes
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

  @DeletedAt
  declare deletedAt: Date;
}
