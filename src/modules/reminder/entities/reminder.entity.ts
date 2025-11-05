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

export interface ReminderAttributes {
  id: number;
  name: string;
  description?: string;
  date: string;
  hour: string;
  inmutable: boolean;
  status?: boolean;
  deletedAt?: Date;
}

export type ReminderCreationAttributes = Optional<
  ReminderAttributes,
  'id' | 'description' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'reminder',
  timestamps: true,
  paranoid: true,
})
export class Reminder extends Model<ReminderAttributes, ReminderCreationAttributes> {
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
    comment: 'Nombre del recordatorio',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Descripcion de Recordatorio',
  })
  description: string;

  @Column({
    field: 'date',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Fecha de Recordatorio',
  })
  date: string;


  @Column({
    field: 'hour',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Hora de Recordatorio',
  })
  hour: string;

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
