import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Role } from '@modules/role/entities/role.entity';
import { User } from '@modules/user/entities/user.entity';
import { RoleScreenOffice } from '@modules/office/entities/role-screen-office.entity';
import { Office } from '@modules/office/entities/office.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
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
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la pantalla',
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
    field: 'path',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Url de la pantalla',
  })
  path: string;

  @Column({
    field: 'icon',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Icono de la pantalla',
  })
  icon: string;

  @ForeignKey(() => Screen)
  @Column({
    field: 'parent_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id de la pantalla padre',
  })
  parentId: number | null;

  @BelongsTo(() => Screen, { foreignKey: 'parentId', onDelete: 'SET NULL' })
  parent: Screen;

  // Relación hijos
  @HasMany(() => Screen, { foreignKey: 'parentId' })
  children: Screen[];

  @BelongsToMany(() => Role, () => RoleScreenOffice)
  roles: Role[];

  @BelongsToMany(() => Office, () => RoleScreenOffice)
  offices: Office[];

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @ForeignKey(() => User)
  @Column({ field: 'created_by', allowNull: true })
  declare createdBy: number;

  @BelongsTo(() => User, 'createdBy')
  declare createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updated_by', allowNull: true })
  declare updatedBy: number;

  @BelongsTo(() => User, 'updatedBy')
  declare updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deleted_by', allowNull: true })
  declare deletedBy: number;

  @BelongsTo(() => User, 'deletedBy')
  declare deletedByUser?: User;

  @CreatedAt
  @Column({ field: 'created_at', allowNull: true })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at', allowNull: true })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at', allowNull: true })
  declare deletedAt: Date;
}
