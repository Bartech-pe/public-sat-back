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

export interface MensajeAutomaticoAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: number;
  estado?: boolean;
  deletedAt?: Date;
}

export type MensajeAutomaticoCreationAttributes = Optional<
  MensajeAutomaticoAttributes,
  'id' | 'nombre' | 'descripcion' | 'tipo' | 'estado' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'mensaje-automatico',
  timestamps: true,
  paranoid: true,
})
export class MensajeAutomatico extends Model<
  MensajeAutomaticoAttributes,
  MensajeAutomaticoCreationAttributes
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
    comment: 'Nombre del Mensaje',
  })
  nombre: string;

  @Column({
    field: 'descripcion',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Descripción del Mensaje',
  })
  descripcion: string;

  @Column({
    field: 'tipo',
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: true,
    comment: 'Tipo del Mensaje',
  })
  tipo: number;

  @Column({
    field: 'estado',
    type: DataType.BOOLEAN,
    allowNull: true,
    comment: 'Estado del Mensaje',
  })
  estado: boolean;

  @DeletedAt
  declare deletedAt: Date;
}
