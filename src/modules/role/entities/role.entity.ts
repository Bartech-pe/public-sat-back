import {
  BelongsToMany,
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
import { User } from '@modules/user/entities/user.entity';
import { Screen } from '@modules/screen/entities/screen.entity';
import { RoleScreen } from './role-screen.entity';

export interface RoleAttributes {
  id: number;
  name: string;
  description?: string;
  inmutable: boolean;
  status?: boolean;
  deletedAt?: Date;
}

export type RoleCreationAttributes = Optional<
  RoleAttributes,
  'id' | 'description' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'roles',
  timestamps: true,
  paranoid: true,
})
export class Role extends Model {
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
    comment: 'Nombre del rol',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.TEXT('long'),
    allowNull: true,
    comment: 'Descripción del rol',
  })
  description: string;

  @Column({
    field: 'inmutable',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Campo para habilitar o inhabilitar la edición de un registro',
  })
  inmutable: boolean;

  @HasMany(() => User)
  users: User[];

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @BelongsToMany(() => Screen, () => RoleScreen)
  screens: Screen[];

  @DeletedAt
  declare deletedAt: Date;
}
