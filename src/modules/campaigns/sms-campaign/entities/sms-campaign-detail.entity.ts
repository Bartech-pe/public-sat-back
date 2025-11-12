import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { SmsCampaign } from './sms-campaign.entity';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] },
}))
@Table({
  tableName: 'sms_campaign_details',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class SmsCampaignDetail extends Model {
  @Column({
    field: 'id',
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({ field: 'sender_id', type: DataType.STRING, allowNull: false })
  senderId: string;

  @Column({ field: 'contact', type: DataType.STRING, allowNull: false })
  contact!: string;

  @ForeignKey(() => SmsCampaign)
  @Column({
    field: 'sms_campaign_id',
    type: DataType.BIGINT,
    allowNull: false,
    comment: 'Id de la campaña sms',
  })
  smsCampaignId: number;
  
  @BelongsTo(() => SmsCampaign)
  smsCampaign: SmsCampaign;

  @Column({ field: 'message', type: DataType.TEXT, allowNull: false })
  message!: string;

  @Column({
    field: 'active',
    type: DataType.ENUM('Y', 'N'),
    comment: 'estado  asignada a la campaña',
    defaultValue: 'N',
  })
  active?: string;


  @ForeignKey(() => User)
  @Column({ field: 'created_by', allowNull: true })
  createdBy?: number;

  @BelongsTo(() => User, 'createdBy')
  createdByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'updated_by', allowNull: true })
  updatedBy?: number;

  @BelongsTo(() => User, 'updatedBy')
  updatedByUser?: User;

  @ForeignKey(() => User)
  @Column({ field: 'deleted_by', allowNull: true })
  deletedBy?: number;

  @BelongsTo(() => User, 'deletedBy')
  deletedByUser?: User;

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
