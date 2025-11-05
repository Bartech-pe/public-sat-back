import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'vicidial_users',
  timestamps: false,
})
export class VicidialUser extends Model {
  @Column({
    field: 'user_id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare user_id: number;

  @Column({
    field: 'user',
    type: DataType.STRING(50),
    allowNull: true,
  })
  user: string;

  @Column({
    field: 'full_name',
    type: DataType.STRING(50),
    allowNull: true,
  })
  full_name: string;

  @Column({
    field: 'user_group',
    type: DataType.STRING(20),
    allowNull: true,
  })
  user_group: string;

  @Column({
    field: 'phone_login',
    type: DataType.STRING(20),
    allowNull: true,
  })
  phone_login: string;

  @Column({
    field: 'phone_pass',
    type: DataType.STRING(100),
    allowNull: true,
  })
  phone_pass: string;
}
