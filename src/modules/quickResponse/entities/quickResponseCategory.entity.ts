import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { QuickResponse } from './quickResponse.entity';

@Table({
  tableName: 'quick-response-category',
  paranoid: true,
  timestamps: true,
})
export class QuickResponseCategory extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  quickResponseCategoryId: number;
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @HasMany(() => QuickResponse)
  quickResponses: QuickResponse[];
}
