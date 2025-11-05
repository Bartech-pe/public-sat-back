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

export interface TipoCampaniaResponseAttributes {
  id: number;
  name: string;
  status?: boolean;
  deletedAt?: Date;
}

export type TipoCampaniaResponseCreationAttributes = Optional<
  TipoCampaniaResponseAttributes,
  'id' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'tipo-campania',
  timestamps: true,
  paranoid: true,
})
export class TipoCampaniaResponse extends Model<TipoCampaniaResponseAttributes, TipoCampaniaResponseCreationAttributes> {

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
      allowNull: true,
      comment: 'Nombre Tipo',
      })
      name: string;

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
