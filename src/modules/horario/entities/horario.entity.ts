import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Feriado } from "./feriado.entity";
import { GestionCampaniaResponse } from "@modules/gestion-campania/entities/gestion-campania.entity";

@Table({
  tableName: 'horario',
  paranoid: true,
  timestamps: true,
})
export class Horario extends Model {

    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    declare id: number;
    @Column({
        type: DataType.TIME,
        allowNull: false,
    })
    hora_inicio:Date
    @Column({
        type: DataType.TIME,
        allowNull: false,
    })
    hora_fin:Date
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false
    })
    dia_inicio:number;
    @Column({
        type: DataType.SMALLINT.UNSIGNED,
        allowNull: false
    })
    dia_fin: number;
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    feriado: boolean

    @ForeignKey(() => GestionCampaniaResponse)
    @Column({ type: DataType.INTEGER, allowNull: true })
    gestion_campania_id: number;

    @BelongsTo(() => GestionCampaniaResponse)
    gestion_campania: GestionCampaniaResponse;
}
