import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Screen } from '@modules/screen/entities/screen.entity';
import { Role } from '@modules/role/entities/role.entity';
import { Office } from '@modules/office/entities/office.entity';

@Table({
  tableName: 'role_screen_offices',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['screen_id', 'role_id', 'office_id'], // 👈 columnas reales en la DB
      name: 'pk_role_screens',
    },
  ],
})
export class RoleScreenOffice extends Model<RoleScreenOffice> {
  @ForeignKey(() => Role)
  @Column({
    field: 'role_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Id del rol',
    primaryKey: true, // 👈 define parte de la PK
  })
  roleId: number;

  @ForeignKey(() => Screen)
  @Column({
    field: 'screen_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Id de la pantalla',
    primaryKey: true, // 👈 define parte de la PK
  })
  screenId: number;

  @ForeignKey(() => Office)
  @Column({
    field: 'office_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Id de la oficina',
    primaryKey: true, // 👈 define parte de la PK
  })
  officeId: number;

  @Column({
    field: 'can_read',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment:
      'Campo para habilitar o inhabilitar la visualización de la pantalla',
  })
  canRead: boolean;

  @Column({
    field: 'can_create',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar la creación de la pantalla',
  })
  canCreate: boolean;

  @Column({
    field: 'can_update',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar la actualizar de la pantalla',
  })
  canUpdate: boolean;

  @Column({
    field: 'can_delete',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar la eliminación de la pantalla',
  })
  canDelete: boolean;

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
