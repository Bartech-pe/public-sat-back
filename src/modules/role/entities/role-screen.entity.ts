import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  DataType,
} from 'sequelize-typescript';
import { Role } from './role.entity';
import { Screen } from '@modules/screen/entities/screen.entity';

@Table({
  tableName: 'roleScreens',
  timestamps: true,
  paranoid: true,
})
export class RoleScreen extends Model {
  @ForeignKey(() => Role)
  @Column
  idRole: number;

  @ForeignKey(() => Screen)
  @Column
  idScreen: number;

  @Column({
    field: 'canRead',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment:
      'Campo para habilitar o inhabilitar la visualización de la pantalla',
  })
  canRead: boolean;

  @Column({
    field: 'canCreate',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar la creación de la pantalla',
  })
  canCreate: boolean;

  @Column({
    field: 'canUpdate',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar la actualizar de la pantalla',
  })
  canUpdate: boolean;

  @Column({
    field: 'canDelete',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar la eliminación de la pantalla',
  })
  canDelete: boolean;

  @DeletedAt
  declare deletedAt: Date;
}
