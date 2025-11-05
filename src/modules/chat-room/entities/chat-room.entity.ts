import {
  BelongsToMany,
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  HasMany,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Message } from './message.entity';
import { User } from '@modules/user/entities/user.entity';
import { UserChatRoom } from './user-chat-room.entity';

export interface ChatRoomAttributes {
  id: number;
  name: string;
  description?: string;
  logoUrl: string;
  status?: boolean;
  deletedAt?: Date;
}

export type ChatRoomCreationAttributes = Optional<
  ChatRoomAttributes,
  'id' | 'description' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'chatRooms',
  timestamps: true,
  paranoid: true,
})
export class ChatRoom extends Model<
  ChatRoomAttributes,
  ChatRoomCreationAttributes
> {
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
    comment: 'Nombre chat',
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si la sala es grupal o entre dos personas',
  })
  isGroup: boolean;

  @HasMany(() => Message)
  messages: Message[];

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

  @DeletedAt
  declare deletedAt: Date;
}
