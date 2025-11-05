import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { QuickResponseCategory } from './quickResponseCategory.entity';

@Table({ tableName: 'quick-response', paranoid: true, timestamps: true })
export class QuickResponse extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  quickResponseId: number;
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;
  @Column({ type: DataType.STRING(500), allowNull: false })
  content: string;
  @Column({ type: DataType.BOOLEAN })
  isActive: boolean;
  @Column({ type: DataType.STRING })
  keywords: string;

  @ForeignKey(() => QuickResponseCategory)
  @Column
  quickResponseCategoryId: number;

  @BelongsTo(() => QuickResponseCategory)
  quickResponseCategory: QuickResponseCategory;
}
