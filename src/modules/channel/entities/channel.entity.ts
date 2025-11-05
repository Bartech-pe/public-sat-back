import {
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
import { Inbox } from '@modules/inbox/entities/inbox.entity';

export interface ChannelAttributes {
  id: number;
  name: string;
  description?: string;
  logo: string;
  status?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type ChannelCreationAttributes = Optional<
  ChannelAttributes,
  'id' | 'description' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
}))
@Scopes(() => ({}))
@Table({
  tableName: 'channels',
  timestamps: true,
  paranoid: true,
})
export class Channel extends Model<ChannelAttributes, ChannelCreationAttributes> {
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
    field: 'description',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Descripción del canal',
  })
  description?: string;

  @Column({
    field: 'logo',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Logo del canal',
  })
  logo: string;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

  @HasMany(() => Inbox, { foreignKey: 'idChannel' })
  inboxes: Inbox[];

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