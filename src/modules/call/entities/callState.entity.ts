import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Call } from './call.entity';
@Table({
  tableName: 'call-state',
  paranoid: true,
  timestamps: true,
})
export class CallState extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  callStateId: number;
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;
  @Column({ type: DataType.STRING, allowNull: false })
  icon: string;
  @Column({ type: DataType.STRING, allowNull: false })
  style: string;
  @HasMany(() => Call)
  calls: Call[];
}
