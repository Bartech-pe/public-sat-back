import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  DataType,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { Team } from './team.entity';

@Table({
  tableName: 'team_users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class TeamUser extends Model {
  @ForeignKey(() => Team)
  @Column({
    field: 'team_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id del equipo',
  })
  teamId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id del usuario',
  })
  userId: number;

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
