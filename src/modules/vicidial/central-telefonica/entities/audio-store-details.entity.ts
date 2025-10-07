import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'audio_store_details',
  timestamps: false,
})
export class AudioStoreDetails extends Model {
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
     primaryKey: true,
  })
  audio_filename: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  audio_format: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  audio_filesize: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  audio_epoch: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  audio_length: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  wav_format_details: string;

  @Column({
    type: DataType.ENUM('', 'GOOD', 'BAD', 'NA'),
    allowNull: false,
    defaultValue: 'GOOD',
  })
  wav_asterisk_valid: '' | 'GOOD' | 'BAD' | 'NA';
}
