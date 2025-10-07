import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  DeletedAt,
  DefaultScope,
  Scopes,
  CreatedAt,
  UpdatedAt,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { CaseInformation } from './case-information.entity';
import { Portfolio } from '@modules/portfolio/entities/portfolio.entity';
import { CitizenContact } from './citizen-contact.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'portfolio_details',
  timestamps: true,
  paranoid: true,
})
export class PortfolioDetail extends Model {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador del detalle de la carpeta',
  })
  declare id: number;

  @ForeignKey(() => Portfolio)
  @Column({
    field: 'portfolio_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Id de la carpeta asignada',
  })
  portfolioId: number;

  @BelongsTo(() => Portfolio)
  portfolio: Portfolio;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Id del usuario',
  })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    field: 'segment',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Segmento del contribuyente (ciudadano)',
  })
  segment: string;

  @Column({
    field: 'profile',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Perfil del contribuyente (ciudadano)',
  })
  profile: string;

  @Column({
    field: 'taxpayer_name',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Nombre del contribuyente (ciudadano)',
  })
  taxpayerName: string;

  @Column({
    field: 'taxpayer_type',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Tipo de contribuyente (ciudadano)',
  })
  taxpayerType: string;

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
    field: 'code',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Código de contribuyente (ciudadano)',
  })
  code: string;

  @Column({
    field: 'debt',
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Deuda del contribuyente (ciudadano)',
  })
  debt: number;

  @Column({
    field: 'current_debt',
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Deuda actual del contribuyente (ciudadano)',
  })
  currentDebt: number;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: false,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status: boolean;

  @HasOne(() => CaseInformation)
  caseInformation: CaseInformation;

  @HasMany(() => CitizenContact, {
    foreignKey: 'docIde',
    sourceKey: 'docIde',
    as: 'citizenContacts',
  })
  citizenContacts: CitizenContact[];

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
