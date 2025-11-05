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
import { TeamUser } from './team-user.entity';

export interface TeamAttributes {
  id: number;
  name: string;
  description?: string;
  inmutable: boolean;
  status?: boolean;
  deletedAt?: Date;
}

export type TeamCreationAttributes = Optional<
  TeamAttributes,
  'id' | 'description' | 'status' | 'deletedAt'
>;

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, // Excluir campo de eliminación lógica y password por defecto
}))
@Scopes(() => ({}))
@Table({
  tableName: 'teams',
  timestamps: true,
  paranoid: true,
})
export class Team extends Model<TeamAttributes, TeamCreationAttributes> {
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
    comment: 'Nombre del equipo',
  })
  name: string;

  @Column({
    field: 'description',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Descripción del equipo',
  })
  description: string;

  @BelongsToMany(() => User, () => TeamUser)
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
