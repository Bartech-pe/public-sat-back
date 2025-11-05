import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { Team } from './team.entity';

@Table({
  tableName: 'teamUsers',
  timestamps: true,
  paranoid: true,
})
export class TeamUser extends Model {
  @ForeignKey(() => User)
  @Column
  idUser: number;

  @ForeignKey(() => Team)
  @Column
  idTeam: number;

  @DeletedAt
  declare deletedAt: Date;
}
