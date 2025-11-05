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
import { Optional } from 'sequelize';
import { Channel } from '@modules/channel/entities/channel.entity';
import { User } from '@modules/user/entities/user.entity';
import { InboxUser } from './inbox-user.entity';
import { ChannelRoom } from '@modules/multi-channel-chat/entities/channel-room.entity';
import { InboxCredential } from './inbox-credentials';

export interface InboxAttributes {
  id: number;
  name: string;
  avatarUrl?: string;
  idChannel: number; // Cambié de idInbox a idChannel para que coincida
  widgetColor?: string;
  phoneNumber?: string;
  status?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type InboxCreationAttributes = Optional<
  InboxAttributes,
  'id' | 'avatarUrl' | 'widgetColor' | 'phoneNumber' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Scopes(() => ({

}))
@Table({
  tableName: 'inboxes',
  timestamps: true,
  paranoid: true,
})
export class Inbox extends Model<InboxAttributes, InboxCreationAttributes> {
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
    comment: 'Nombre del canal',
  })
  name: string;

  @Column({
    field: 'avatarUrl',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Imagen del canal',
  })
  avatarUrl?: string;

  @Column({
    field: 'widgetColor',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Widget color del canal',
  })
  widgetColor?: string;

  @ForeignKey(() => Channel)
  @Column({
    field: 'idChannel',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID del canal al que pertenece este inbox',
  })
  idChannel: number;


  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

  // Relaciones - Sin declare para evitar problemas
  @BelongsTo(() => Channel, { foreignKey: 'idChannel' })
  channel: Channel;

  @HasOne(() => InboxCredential, { foreignKey: 'inboxId' })
  credentials: InboxCredential;

  @BelongsToMany(() => User, () => InboxUser)
  users: User[];

  @HasMany(() => ChannelRoom)
  channelRooms: ChannelRoom[];
  
  @Column({
    field: 'createdAt',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @Column({
    field: 'updatedAt',
    type: DataType.DATE,
  })
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;
}