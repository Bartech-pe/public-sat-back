import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  DataType,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { Skill } from './skill.entity';

@Table({
  tableName: 'skill_users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class SkillUser extends Model {
  @ForeignKey(() => Skill)
  @Column({
    field: 'skill_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id de la habilidad',
  })
  skillId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id del usuario',
  })
  userId: number;

  @Column({
    field: 'score',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Puntaje asignado al usuario en la habilidad',
  })
  score: number;

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
