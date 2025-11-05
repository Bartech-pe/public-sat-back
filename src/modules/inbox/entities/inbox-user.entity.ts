import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  BelongsTo,
  DataType
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { Inbox } from './inbox.entity';
import { EstadoCanal } from '@modules/estado-canal/entities/estado-canal.entity';

export interface InboxUserAttributes {
  idUser: number;
  idInbox: number;
  stateChannelId?:number|null;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}

@Table({
  tableName: 'inboxUsers',
  timestamps: true,
  paranoid: true,
})
export class InboxUser  extends Model<InboxUserAttributes> implements InboxUserAttributes {
  @ForeignKey(() => User)
  @Column
  idUser: number;

  
  @ForeignKey(() => Inbox)
  @Column
  idInbox: number;

  @BelongsTo(() => Inbox)
  inbox: Inbox;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => EstadoCanal)
  @Column({
    field: 'state_channel_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id Estado de canal asignado al asesor',
  })
  stateChannelId?: number|null;

  @BelongsTo(() => EstadoCanal)
  stateChannel: EstadoCanal

  @DeletedAt
  declare deletedAt: Date | null;
}
