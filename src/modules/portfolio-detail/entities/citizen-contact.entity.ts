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
import { PortfolioDetail } from './portfolio-detail.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'citizen_contacts',
  timestamps: true,
  paranoid: true,
})
export class CitizenContact extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'tip_doc',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Tipo de documento de identificación del ciudadano (RUC, DNI)',
  })
  tipDoc: string;

  @Column({
    field: 'doc_ide',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Documento de identificación del ciudadano',
  })
  docIde: string;

  @Column({
    field: 'contact_type',
    type: DataType.ENUM('PHONE', 'EMAIL', 'WHATSAPP'),
    allowNull: false,
    comment: 'Fecha del compromiso de pago',
  })
  contactType: string;

  @Column({
    field: 'value',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Valor de contacto',
  })
  value: string;

  @Column({
    field: 'is_additional',
    type: DataType.BOOLEAN,
    allowNull: false,
    comment: 'Es información adicional',
  })
  isAdditional: boolean;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @BelongsTo(() => PortfolioDetail, {
    foreignKey: 'docIde',
    targetKey: 'docIde',
    as: 'portfolioDetail',
  })
  portfolioDetail: PortfolioDetail;

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
