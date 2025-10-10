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
  HasOne,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Channel } from '@modules/channel/entities/channel.entity';
import { User } from '@modules/user/entities/user.entity';
import { InboxUser } from './inbox-user.entity';
import { ChannelRoom } from '@modules/multi-channel-chat/entities/channel-room.entity';
import { InboxCredential } from './inbox-credential.entity';
import { EmailCredential } from '@modules/email/entities/email-credentials.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'inboxes',
  timestamps: true,
  paranoid: true,
})
export class Inbox extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la bandeja de entrada',
  })
  declare id: number;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre de la bandeja de entrada',
  })
  name: string;

  @Column({
    field: 'avatar_url',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Imagen del canal',
  })
  avatarUrl?: string;

  @Column({
    field: 'widget_color',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Widget color del canal',
  })
  widgetColor?: string;

  @ForeignKey(() => Channel)
  @Column({
    field: 'channel_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'ID del canal al que pertenece la bandeja de entrada',
  })
  channelId: number;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

  // Relaciones - Sin declare para evitar problemas
  @BelongsTo(() => Channel, { foreignKey: 'channelId' })
  channel: Channel;

  @HasOne(() => InboxCredential, { foreignKey: 'inboxId' })
  credentials: InboxCredential;

  @BelongsToMany(() => User, () => InboxUser)
  users: User[];

  @HasMany(() => ChannelRoom)
  channelRooms: ChannelRoom[];

  @HasOne(() => EmailCredential, { foreignKey: 'inboxId' })
  emailCredentials: EmailCredential;

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
