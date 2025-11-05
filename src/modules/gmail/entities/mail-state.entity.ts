import { Column, CreatedAt, DataType, DefaultScope, DeletedAt, Model, Table, UpdatedAt } from "sequelize-typescript";

@DefaultScope(() => ({
        attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Table({
        tableName: 'mailStates',
        timestamps: true,
        paranoid: true,
        underscored: true,
})
export class MailState extends Model {
    @Column({
        field: 'id',
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;
    @Column({
        field: 'name',
        type: DataType.STRING,
        allowNull: false,
        comment: 'Nombre del Estado del Correo',
    })
    name: string;
    @Column({
        field: 'code',
        type: DataType.STRING(10),
        allowNull: false,
        comment: 'Codigo del Estado del Correo',
    })
    code: string;
    @Column({
        field: 'icon',
        type: DataType.STRING,
        allowNull: false,
        comment: 'Icono del Estado del Correo',
    })
    icon: string;
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
