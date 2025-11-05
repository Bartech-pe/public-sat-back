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
  attributes: { exclude: ['deletedAt'] },
}))
@Table({
  tableName: 'surveys',
  timestamps: true,
  paranoid: true,
})
export class Survey extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'assistanceId',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID of the associated assistance',
  })
  assistanceId: number;

  @Column({
    field: 'channelRoomId',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID of the channel room',
  })
  channelRoomId: number;

  @Column({
    field: 'citizenId',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID of the citizen',
  })
  citizenId: number;

  @Column({
    field: 'comment',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Comment provided in the survey',
  })
  comment: string;

  @Column({
    field: 'rating',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Rating given in the survey (1-5)',
  })
  rating: number;

  @ForeignKey(() => User)
  @Column({
    field: 'userId',
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'ID of the user who submitted the survey',
  })
  userId: number;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @BelongsTo(() => User, 'userId')
  declare user?: User;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}