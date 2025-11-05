import { BelongsTo, Column, CreatedAt, DataType, DefaultScope, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { GestionCampaniaResponse } from "./gestion-campania.entity";
import { User } from "@modules/user/entities/user.entity";
@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] }, 
}))
@Table({
  tableName: 'smscampaingdetails',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class SmsCampaingDetail extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;
  @Column({ field: 'sender_id', type: DataType.STRING, allowNull: false })
  senderId?: string
  @Column({ field: 'contact', type: DataType.STRING, allowNull: false })
  contact?: string 
  @Column({ field: 'country_code', type: DataType.BOOLEAN, allowNull: true })
  countryCode?: boolean | null
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'message'
  })
  message: string;
  @Column({
    type: DataType.JSON,
    allowNull: false,
    field: 'excel_data'
  })
  excelData: Record<string, any>;

  @ForeignKey(() => GestionCampaniaResponse)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'gestion_campania_id', })
  gestion_campania_id: number;

  @BelongsTo(() => GestionCampaniaResponse)
    gestion_campania: GestionCampaniaResponse;



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
