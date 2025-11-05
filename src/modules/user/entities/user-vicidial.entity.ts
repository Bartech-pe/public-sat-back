import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'userVicidial',
  timestamps: true,
  paranoid: true,
})
export class UserVicidial extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'username',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Username del agente en Vicidial',
  })
  username: string;

  @Column({
    field: 'userPass',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Password de usuario en Vicidial',
  })
  userPass: string;

  @Column({
    field: 'phoneLogin',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Extensión/teléfono del agente',
  })
  phoneLogin: string;

  @Column({
    field: 'phonePass',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Password del teléfono SIP',
  })
  phonePass: string;

  @Column({
    field: 'userLevel',
    type: DataType.TINYINT,
    allowNull: true,
    comment: 'Nivel de usuario (1=agente, 9=admin)',
  })
  userLevel: number;

  @Column({
    field: 'userGroup',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Grupo del usuario (ej: AGENTS)',
  })
  userGroup: string;

  @ForeignKey(() => User)
  @Column({ field: 'idUser', allowNull: false })
  idUser: number;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => User)
  @Column({ field: 'createdBy', allowNull: true })
  declare createdBy: number;

  @BelongsTo(() => User, 'createdBy')
  declare createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updatedBy', allowNull: true })
  declare updatedBy: number;

  @BelongsTo(() => User, 'updatedBy')
  declare updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deletedBy', allowNull: true })
  declare deletedBy: number;

  @BelongsTo(() => User, 'deletedBy')
  declare deletedByUser?: User;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
