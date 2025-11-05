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
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] },
  order: [['createdAt', 'DESC']],
}))
@Scopes(() => ({}))
@Table({
  tableName: 'notifications',
  timestamps: true,
  paranoid: true,
})
export class Notification extends Model {

  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    field: 'userId',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID del usuario que recibe la notificación',
  })
  userId: number;

  @BelongsTo(() => User, 'userId')
  user?: User;

  @Column({
    field: 'message',  
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Mensaje de la notificación',
  })
  message: string;

  @Column({
    field: 'isRead',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si la notificación ha sido leída',
  })
  isRead: boolean;

  @ForeignKey(() => User)
  @Column({ field: 'createdBy', allowNull: true })
  declare createdBy: number;

  @BelongsTo(() => User, 'createdBy')
  declare createdByUser?: User;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
