import { Column, DataType, Model, Table } from "sequelize-typescript";
@Table({
  tableName: 'feriado',
  paranoid: true,
  timestamps: true,
})
export class Feriado  extends Model{
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    declare id: number;
    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
    feriado_fecha: Date;
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    feriado_titulo: string;
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    feriado_descripcion: string;
}
