import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { QuickResponseCategory } from './quick-response-category.entity';
import { User } from '@modules/user/entities/user.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'quick_responses',
  paranoid: true,
  timestamps: true,
  underscored: true,
})
export class QuickResponse extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la respuesta rápida',
  })
  declare id: number;

  @Column({
    field: 'title',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Titulo de la respuesta rápida',
  })
  title: string;

  @Column({
    field: 'content',
    type: DataType.STRING(500),
    allowNull: false,
    comment: 'Contenido de la respuesta rápida',
  })
  content: string;

  @Column({
    field: 'keywords',
    type: DataType.JSON,
    comment: 'Palabras clave de la respuesta rápida',
  })
  keywords: string;

  @ForeignKey(() => QuickResponseCategory)
  @Column({
    field: 'quick_response_category_id',
    type: DataType.BIGINT,
    allowNull: false,
  })
  quickResponseCategoryId: number;

  @BelongsTo(() => QuickResponseCategory)
  quickResponseCategory: QuickResponseCategory;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

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
