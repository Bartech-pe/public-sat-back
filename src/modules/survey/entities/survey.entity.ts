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
  tableName: 'surveys',
  timestamps: true,
  paranoid: true,
})
export class Survey extends Model<Survey> {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'assistance_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'ID of the associated assistance',
  })
  assistanceId: number;

  @Column({
    field: 'channel_room_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'ID of the channel room',
  })
  channelRoomId: number;

  @Column({
    field: 'citizen_id',
    type: DataType.BIGINT,
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
    type: DataType.SMALLINT,
    allowNull: false,
    comment: 'Rating given in the survey (1-5)',
  })
  rating: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
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
