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
import { Citizen } from '@modules/citizen/entities/citizen.entity';
import { Office } from '@modules/office/entities/office.entity';
import { CitizenContact } from '@modules/citizen/entities/citizen-contact.entity';
import { ConsultType } from '@modules/consult-type/entities/consult-type.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))
@Table({
  tableName: 'generic_assistances',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class GenericAssistance extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
    comment: 'Identificador del canal',
  })
  declare id: number;

  @Column({
    field: 'consult_type_code',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Id del tipo de consulta',
  })
  consultTypeCode: string;

  @BelongsTo(() => ConsultType, {
    foreignKey: 'consult_type_code',
    targetKey: 'code',
    as: 'consultType',
  })
  consultType: ConsultType;

  @ForeignKey(() => Citizen)
  @Column({
    field: 'citizen_id',
    type: DataType.BIGINT,
    allowNull: true,
    comment: 'Id del ciudadano',
  })
  citizenId: number;

  @ForeignKey(() => Office)
  @Column({
    field: 'office_id',
    type: DataType.BIGINT,
    allowNull: true,
    comment: 'ID de la oficina',
  })
  officeId: number;

  @ForeignKey(() => CitizenContact)
  @Column({
    field: 'citizen_contact_id',
    type: DataType.BIGINT,
    allowNull: true,
    comment: 'Identificador del contacto del ciudadano',
  })
  citizenContactId: number;

  @Column({
    field: 'detail',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Detalle de atención',
  })
  detail: string;

  @Column({
    field: 'status',
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;

  @BelongsTo(() => Citizen)
  citizen: Citizen;

  @BelongsTo(() => CitizenContact)
  contact: CitizenContact;

  @BelongsTo(() => Office)
  office: Office;

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
