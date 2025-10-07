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
import { User } from '@modules/user/entities/user.entity';
import { ConsultType } from '@modules/consult-type/entities/consult-type.entity';
import { Citizen } from '@modules/citizen/entities/citizen.entity';
import { CategoryChannel } from '@modules/channel/entities/category-channel.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'channel_assistances',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class ChannelAssistance extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador del canal',
  })
  declare id: number;

  @ForeignKey(() => ConsultType)
  @Column({
    field: 'consult_type_id',
    type: DataType.BIGINT,
    allowNull: true,
    comment: 'Id del tipo de consulta',
  })
  consultTypeId: number;

  @ForeignKey(() => Citizen)
  @Column({
    field: 'citizen_id',
    type: DataType.BIGINT,
    allowNull: true,
    comment: 'Id del ciudadano',
  })
  citizenId: number;

  @ForeignKey(() => CategoryChannel)
  @Column({
    field: 'category_id',
    type: DataType.BIGINT,
    allowNull: true,
    comment: 'Id de la categoria del canal de atención',
  })
  categoryId: number;

  @Column({
    field: 'detail',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Detalle de atención',
  })
  detail: string;

  @Column({
    field: 'communication_id',
    type: DataType.BIGINT,
    allowNull: true,
    comment: 'Identificador de la comunicación del ciudadano',
  })
  communicationId: number;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

  @BelongsTo(() => ConsultType)
  consultType: ConsultType;

  @BelongsTo(() => Citizen)
  citizen: Citizen;

  @BelongsTo(() => CategoryChannel)
  categoryChannel: CategoryChannel;

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
