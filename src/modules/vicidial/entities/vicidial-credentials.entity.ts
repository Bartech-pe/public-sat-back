import {
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  Model,
  Table,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { User } from '@modules/user/entities/user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] },
}))
@Table({
  tableName: 'vicidial_credentials',
  timestamps: true,
  paranoid: true,
})
export class VicidialCredential extends Model {
  @ForeignKey(() => Inbox)
  @Column({
    field: 'inbox_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
  })
  inboxId: number;

  @Column({
    field: 'vicidial_host',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Vicidial server hostname or URL',
  })
  vicidialHost: string;

  @Column({
    field: 'public_ip',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Public IP of Vicidial server',
  })
  publicIp: string;

  @Column({
    field: 'private_ip',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Private IP of Vicidial server',
  })
  privateIp: string;

  @Column({
    field: 'user',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Vicidial API user',
  })
  user: string;

  @Column({
    field: 'password',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Vicidial API password',
  })
  password: string;

  @BelongsTo(() => Inbox, { foreignKey: 'inboxId' })
  inbox: Inbox;

  // Auditoría
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

  // Timestamps
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
