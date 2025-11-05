import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { UserRole } from '@common/constants/role.constant';
import { Optional } from 'sequelize';
import { Role } from '@modules/role/entities/role.entity';
import { Team } from '@modules/team/entities/team.entity';
import { TeamUser } from '@modules/team/entities/team-user.entity';
import { Skill } from '@modules/skill/entities/skill.entity';
import { SkillUser } from '@modules/skill/entities/skill-user.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { InboxUser } from '@modules/inbox/entities/inbox-user.entity';
import { Oficina } from '@modules/oficina/entities/oficina.entity';
import { UserVicidial } from './user-vicidial.entity';

export interface UserAttributes {
  id: number;
  name: string;
  displayName?: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role: UserRole;
  verified?: boolean;
  status?: boolean;
  deletedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'displayName' | 'avatarUrl' | 'verified' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['password', 'deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({
  withPassword: {
    attributes: { include: ['password'] },
  }, // Devolver password para casos especificos
}))
@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
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
    comment: 'Nombre completo',
  })
  name: string;

  @Column({
    field: 'displayName',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Nombre a mostrar en las conversaciones',
  })
  displayName: string;

  @Column({
    field: 'email',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Correo electrónico, sirve para autenticar el usuario',
  })
  email: string;

  @Column({
    field: 'password',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Contraseña encriptada',
  })
  password: string;

  @Column({
    field: 'avatarUrl',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Imagen para visualizar en el perfil',
  })
  avatarUrl: string;

  @ForeignKey(() => Role)
  @Column({
    field: 'idRole',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'id Rol asignado al usuario',
  })
  idRole: number;

  @BelongsTo(() => Role)
  role: Role;

  @ForeignKey(() => Oficina)
  @Column({
    field: 'idOficina',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'id Oficina asignada al usuario',
  })
  idOficina: number;

  @BelongsTo(() => Oficina)
  oficina: Oficina;

  @HasOne(() => UserVicidial)
  vicidial: UserVicidial;

  @Column({
    field: 'verified',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Correo electrónico verificado',
  })
  verified: boolean;

  @BelongsToMany(() => Team, () => TeamUser)
  teams: Team[];

  @BelongsToMany(() => Skill, () => SkillUser)
  skills: Skill[];


  @BelongsToMany(() => Inbox, () => InboxUser)
  inboxes: Inbox[];

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
