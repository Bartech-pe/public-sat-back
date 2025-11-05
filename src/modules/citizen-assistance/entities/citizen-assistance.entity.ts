import { PortfolioDetail } from '@modules/portfolio-detail/entities/portfolio-detail.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasOne,
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
  tableName: 'citizen_assistances',
  timestamps: true,
  paranoid: true,
})
export class CitizenAssistance extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador de la atención al ciudadano',
  })
  declare id: number;

  @Column({
    field: 'method',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Metodo de atención',
  })
  method: string;

  @Column({
    field: 'type',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Tipo de atención',
  })
  type: string;

  @Column({
    field: 'channel',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Canal de atención',
  })
  channel: string;

  @Column({
    field: 'contact',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Contacto de atención',
  })
  contact: string;

  @Column({
    field: 'result',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Resultado de atención',
  })
  result: string;

  @Column({
    field: 'observation',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Observación de atención',
  })
  observation: string;

  @Column({
    field: 'tip_doc',
    type: DataType.STRING,
    allowNull: true,
    comment:
      'Tipo de documento de identificación del ciudadano (1->RUC y 2->DNI)',
  })
  tipDoc: string;

  @Column({
    field: 'doc_ide',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Documento de identificación del ciudadano',
  })
  docIde: string;

  @Column({
    field: 'verify_payment',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Campo para marcar si es una verificación de pago',
  })
  verifyPayment: boolean;

  @ForeignKey(() => PortfolioDetail)
  @Column({
    field: 'portfolio_detail_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id cartera detalle de la atención',
  })
  portfolioDetailId: number;

  @BelongsTo(() => PortfolioDetail)
  portfolioDetail: PortfolioDetail;

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
