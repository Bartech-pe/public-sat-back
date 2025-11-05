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

export interface PredefinedResponseAttributes {
  id: number;
  code: string;
  message?: string;
  inmutable: boolean;
  status?: boolean;
  deletedAt?: Date;
}

export type PredefinedResponseCreationAttributes = Optional<
  PredefinedResponseAttributes,
  'id' | 'message' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'predefined-response',
  timestamps: true,
  paranoid: true,
})

export class PredefinedResponse extends Model<PredefinedResponseAttributes, PredefinedResponseCreationAttributes>{
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'code',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Código corto',
  })
  code: string;

  @Column({
    field: 'message',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Mensaje',
  })
  message: string;

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
