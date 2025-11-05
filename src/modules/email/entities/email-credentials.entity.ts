import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] },
}))
@Table({
  tableName: 'email_credentials',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class EmailCredential extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Inbox)
  @Column({
    field: 'inbox_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  inboxId: number;

  @BelongsTo(() => Inbox)
  inbox: Inbox;

  @Column({
    field: 'email',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Correo electrónico',
  })
  email: string;

  @Column({
    field: 'refresh_token',
    type: DataType.STRING,
    allowNull: true,
    comment: 'API key for channel integration',
  })
  refreshToken?: string;

  @Column({
    field: 'client_id',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Client ID for channel integration',
  })
  clientID?: string;

  @Column({
    field: 'client_secret',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Client Secret for channel integration',
  })
  clientSecret?: string;

  @Column({
    field: 'client_project',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Client Project for channel integration',
  })
  clientProject?: string;

  @Column({
    field: 'client_topic',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Client Topic for channel integration',
  })
  clientTopic?: string;

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
