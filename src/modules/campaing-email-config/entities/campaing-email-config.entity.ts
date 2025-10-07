import { TemplateEmail } from '@modules/template-email/entities/template-email.entity';
import { User } from '@modules/user/entities/user.entity';
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

@DefaultScope(() => ({
      attributes: { exclude: ['deletedAt', 'deletedBy'] }, // Excluir campo de eliminación lógica
}))
@Scopes(() => ({}))

@Table({
      tableName: 'campaign_email_configs',
      timestamps: true,
      paranoid: true,
})
export class CampaignEmailConfig extends Model {

      @Column({
            field: 'id',
            type: DataType.BIGINT,
            autoIncrement: true,
            primaryKey: true,
      })
      declare id: number;

      @Column({
            field: 'name',
            type: DataType.STRING,
            allowNull: false,
            comment: 'Nombre del campaña',
      })
      name: string;

      @Column({
            field: 'total_registration',
            type: DataType.INTEGER,
            allowNull: false,
            comment: 'total registro',
      })
      totalRegistration: number;

      @Column({
            field: 'campaign_status',
            type: DataType.INTEGER,
            allowNull: false,
            comment: '1:Aprobado 2:pediente 3:finalizado',
      })
      campaignStatus: number;

      @ForeignKey(() => TemplateEmail)
      @Column({
            field: 'id_template',
            type: DataType.INTEGER,
            allowNull: false,
            comment: 'id plantilla correo',
      })
      idTemplate: number;

      @BelongsTo(() => TemplateEmail)
      template: TemplateEmail;

      @Column({
            field: 'status',
            type: DataType.BOOLEAN,
            defaultValue: true,
            comment: 'Campo para habilitar o inhabilitar un registro',
      })
      status: boolean;

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
