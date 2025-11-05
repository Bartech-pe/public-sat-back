import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { RoleScreen } from '@modules/role/entities/role-screen.entity';
import { Role } from '@modules/role/entities/role.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'screens',
  timestamps: true,
  paranoid: true,
})
export class Screen extends Model {
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
    comment: 'Nombre de la pantalla',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.TEXT('long'),
    allowNull: true,
    comment: 'Descripción de la pantalla',
  })
  description: string;

  @Column({
    field: 'url',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Url de la pantalla',
  })
  url: string;

  @Column({
    field: 'icon',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Icono de la pantalla',
  })
  icon: string;

  @ForeignKey(() => Screen)
  @Column({
    field: 'idParent',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id de la pantalla padre',
  })
  idParent: number;

  @BelongsTo(() => Screen, { foreignKey: 'idParent', onDelete: 'SET NULL' })
  parent: Screen;

  @BelongsToMany(() => Role, () => RoleScreen)
  roles: Role[];

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
