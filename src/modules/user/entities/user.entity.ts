import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasOne,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Role } from '@modules/role/entities/role.entity';
import { Office } from '@modules/office/entities/office.entity';
import { VicidialUser } from './vicidial-user.entity';
import { Team } from '@modules/team/entities/team.entity';
import { TeamUser } from '@modules/team/entities/team-user.entity';
import { Skill } from '@modules/skill/entities/skill.entity';
import { SkillUser } from '@modules/skill/entities/skill-user.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { InboxUser } from '@modules/inbox/entities/inbox-user.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['password', 'deletedAt', 'deletedBy'] }, // Excluir password y campo de eliminación lógica
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
  underscored: true,
})
export class User extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador del usuario',
  })
  declare id: number;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre completo del usuario',
  })
  name: string;

  @Column({
    field: 'display_name',
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
    field: 'avatar_url',
    type: DataType.TEXT('long'),
    allowNull: true,
    comment: 'Imagen para visualizar en el perfil',
  })
  avatarUrl: string;

  @ForeignKey(() => Role)
  @Column({
    field: 'role_id',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'id Rol asignado al usuario',
  })
  roleId: number;

  @BelongsTo(() => Role)
  role: Role;

  @ForeignKey(() => Office)
  @Column({
    field: 'office_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'id Office asignada al usuario',
  })
  officeId: number;

  @BelongsTo(() => Office)
  office: Office;

  @HasOne(() => VicidialUser)
  vicidial: VicidialUser;

  @Column({
    field: 'verified_email',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Correo electrónico verificado',
  })
  verifiedEmail: boolean;

  @BelongsToMany(() => Team, () => TeamUser)
  teams: Team[];

  @BelongsToMany(() => Skill, () => SkillUser)
  skills: Skill[];

  @BelongsToMany(() => Inbox, () => InboxUser)
  inboxes: Inbox[];

  @BelongsToMany(() => ChannelState, () => InboxUser)
  channelStates: ChannelState[];

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
