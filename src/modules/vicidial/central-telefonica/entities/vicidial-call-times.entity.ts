import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: 'vicidial_call_times',
  timestamps: false,
})
export class VicidialCallTimes extends Model {
    @Column({
        type: DataType.STRING(10),
        allowNull: false,
        primaryKey: true,
    })
    call_time_id: number;
    @Column({
        type: DataType.STRING(30),
        allowNull: false,
    })
    call_time_name: string;
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    call_time_comments: string;
    @Column({
        type: DataType.SMALLINT,
        allowNull: false,
    })
    ct_default_start:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_default_stop:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_sunday_start:number
     @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_sunday_stop:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_monday_start:number
     @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_monday_stop:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_tuesday_start:number
     @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_tuesday_stop:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_wednesday_start:number
     @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_wednesday_stop:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_thursday_start:number
     @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_thursday_stop:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_friday_start:number
     @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_friday_stop:number
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_saturday_start:number
     @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false,
    })
    ct_saturday_stop:number
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    ct_state_call_times:string
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    default_afterhours_filename_override
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    sunday_afterhours_filename_override
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    monday_afterhours_filename_override
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    tuesday_afterhours_filename_override
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    wednesday_afterhours_filename_override
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    thursday_afterhours_filename_override
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    friday_afterhours_filename_override
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    saturday_afterhours_filename_override
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    user_group
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    ct_holidays:string

}
