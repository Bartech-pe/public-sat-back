import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'vicidial_campaigns',
  timestamps: false,
})
export class VicidialCampaign extends Model {
  @Column({
    field: 'campaign_id',
    type: DataType.STRING(8),
    primaryKey: true,
  })
  campaign_id: string;

  @Column({
    field: 'campaign_name',
    type: DataType.STRING(40),
    allowNull: true,
  })
  campaign_name: string;

  @Column({
    field: 'active',
    type: DataType.ENUM('Y', 'N'),
    defaultValue: 'Y',
  })
  active?: string;

  @Column({
    field: 'campaign_vdad_exten',
    type: DataType.STRING(20),
    defaultValue: '8366',
  })
  campaign_vdad_exten?: string;

  @Column({
    field: 'survey_first_audio_file',
    type: DataType.TEXT,
  })
  survey_first_audio_file?: string;

  @Column({
    field: 'dial_method',
    type: DataType.ENUM(
      'MANUAL',
      'RATIO',
      'ADAPT_HARD_LIMIT',
      'ADAPT_TAPERED',
      'ADAPT_AVERAGE',
      'INBOUND_MAN',
      'SHARED_RATIO',
      'SHARED_ADAPT_HARD_LIMIT',
      'SHARED_ADAPT_TAPERED',
      'SHARED_ADAPT_AVERAGE',
    ),
    defaultValue: 'RATIO',
  })
  dial_method?: string;

  @Column({
    field: 'auto_dial_level',
    type: DataType.DECIMAL(10, 2),
    defaultValue: 1,
  })
  auto_dial_level?: number;

  @Column({
    field: 'local_call_time',
    type: DataType.STRING(10),
    defaultValue: '9am-9pm',
  })
  local_call_time?: string;
}
