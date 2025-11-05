import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
   tableName: 'vicidial_lists', 
   timestamps: false 
})
export class VicidialLists  extends Model {
  
  @Column({ 
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true
  })
  list_id: number;

  @Column({ 
    type: DataType.STRING(30),
    allowNull: true
  })
  list_name?: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  list_description?: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  campaign_id?: string;

  @Column({ type: DataType.ENUM('Y', 'N'), defaultValue:'N' })
  active?: string;

}
