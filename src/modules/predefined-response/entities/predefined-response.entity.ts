import { CategoryChannel } from '@modules/channel/entities/category-channel.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'predefined_responses',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class PredefinedResponse extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la respuesta predefinida',
  })
  declare id: number;

  @Column({
    field: 'code',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Código corto',
  })
  code: string;

  @Column({
    field: 'title',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Título del la respuesta',
  })
  title: string;

  @Column({
    field: 'content',
    type: DataType.TEXT('long'),
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

  @ForeignKey(() => CategoryChannel)
  @Column({
    field: 'category_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Parametro para identificar el canal al que pertenece el estado',
  })
  categoryId: number;

  @BelongsTo(() => CategoryChannel)
  category: CategoryChannel;

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
