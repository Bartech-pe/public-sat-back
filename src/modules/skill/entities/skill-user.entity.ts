import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  DataType,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { Skill } from './skill.entity';

@Table({
  tableName: 'skillUsers',
  timestamps: true,
  paranoid: true,
})
export class SkillUser extends Model {
  @ForeignKey(() => User)
  @Column
  idUser: number;

  @ForeignKey(() => Skill)
  @Column
  idSkill: number;

  @Column({
    field: 'score',
    type: DataType.FLOAT,
    allowNull: false,
    comment: 'Puntaje asignado al usuario en la habilidad',
  })
  score: number;

  @DeletedAt
  declare deletedAt: Date;
}
