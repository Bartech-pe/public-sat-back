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
import { ChatRoomMessage } from './chat-room-message.entity';
import { User } from '@modules/user/entities/user.entity';
import { UserChatRoom } from './user-chat-room.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'chat_rooms',
  timestamps: true,
  paranoid: true,
})
export class ChatRoom extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la sala de chat',
  })
  declare id: number;

  @Column({
    field: 'name',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Nombre chat',
  })
  name: string;

  @Column({
    field: 'is_group',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si la sala es grupal o entre dos personas',
  })
  isGroup: boolean;

  @HasMany(() => ChatRoomMessage)
  messages: ChatRoomMessage[];

  @BelongsToMany(() => User, () => UserChatRoom)
  users: User[];

  // Esta segunda asociación solo es para filtrar (no la necesitas si usas include directo con alias)
  @BelongsToMany(() => User, {
    through: () => UserChatRoom,
    as: 'filteredUsers',
  })
  filteredUsers: User[];

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
