import {
  BelongsToMany,
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
import { User } from '@modules/user/entities/user.entity';
import { SkillUser } from './skill-user.entity';

export interface SkillAttributes {
  id: number;
  name: string;
  category: string;
  description: string;
  status?: boolean;
  deletedAt?: Date;
}

export type SkillCreationAttributes = Optional<
  SkillAttributes,
  'id' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'skills',
  timestamps: true,
  paranoid: true,
})
export class Skill extends Model<SkillAttributes, SkillCreationAttributes> {
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
    comment: 'Nombre de la habilidad',
  })
  name: string;
  
  @Column({
    field: 'category',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Categoría de la habilidad',
  })
  category: string;

  @Column({
    field: 'description',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Descripción de la habilidad',
  })
  description: string;

  @BelongsToMany(() => User, () => SkillUser)
  users: User[];

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @DeletedAt
  declare deletedAt: Date;
}
