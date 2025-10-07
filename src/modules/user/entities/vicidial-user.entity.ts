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
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'vicidial_users',
  timestamps: true,
  paranoid: true,
})
export class VicidialUser extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
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
    field: 'user_password',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Password de usuario en Vicidial',
  })
  userPass: string;

  @Column({
    field: 'phone_login',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Extensión/teléfono del agente',
  })
  phoneLogin: string;

  @Column({
    field: 'phone_password',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Password del teléfono SIP',
  })
  phonePass: string;

  @Column({
    field: 'user_level',
    type: DataType.TINYINT,
    allowNull: true,
    comment: 'Nivel de usuario (1=agente, 9=admin)',
  })
  userLevel: number;

  @Column({
    field: 'user_group',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Grupo del usuario (ej: AGENTS)',
  })
  userGroup: string;

  @ForeignKey(() => User)
  @Column({ field: 'user_id', allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => ChannelState)
  @Column({
    field: 'channel_state_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id Estado de canal asignado al asesor',
  })
  channelStateId?: number;

  @BelongsTo(() => ChannelState)
  channelState: ChannelState;

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
