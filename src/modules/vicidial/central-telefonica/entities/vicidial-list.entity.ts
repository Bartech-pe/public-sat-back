import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ 
  tableName: 'vicidial_list', 
  timestamps: false 
})
export class VicidialLead  extends Model {

  @Column({ 
      field: 'lead_id',
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  })
  lead_id: number;

  @Column({ type: DataType.STRING(20), allowNull: true})
  status?: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  first_name?: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  last_name?: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  phone_number?: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  list_id?: number;

}
