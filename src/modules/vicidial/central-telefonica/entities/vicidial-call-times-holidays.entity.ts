import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: 'vicidial_call_time_holidays',
  timestamps: false,
})
export class VicidialCallTimesHolidays extends Model {
    @Column({
        type: DataType.STRING(30),
        allowNull: false,
        primaryKey: true,
    })
    holiday_id: number;
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    holiday_name: string;
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    holiday_comments: string;
    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
    holiday_date: Date;
    @Column({
        type: DataType.ENUM('ACTIVE', 'INACTIVE', 'EXPIRED'),
        allowNull: false,
    })
    holiday_status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_default_start:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_default_stop:number
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    default_afterhours_filename_override:string
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    user_group:string
    @Column({
        type: DataType.STRING(40),
        allowNull: false,
    })
    holiday_method:string

}
