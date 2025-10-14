import { CategoryChannel } from '@modules/channel/entities/category-channel.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { InboxUser } from '@modules/inbox/entities/inbox-user.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  BelongsToMany,
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

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'channel_states',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class ChannelState extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre del estado',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Descripción del estado',
  })
  description: string;

  @Column({
    field: 'color',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Color de Estado',
  })
  color: string;

  @Column({
    field: 'inmutable',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Campo para habilitar o inhabilitar la edición de un registro',
  })
  inmutable: boolean;

  @ForeignKey(() => CategoryChannel)
  @Column({
    field: 'category_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Parametro para identificar el canal al que pertenece el estado',
  })
  categoryId: number;

  @BelongsTo(() => CategoryChannel)
  category: CategoryChannel;

  @BelongsToMany(() => User, () => InboxUser)
  users: User[];

  @BelongsToMany(() => Inbox, () => InboxUser)
  inboxes: Inbox[];

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

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
