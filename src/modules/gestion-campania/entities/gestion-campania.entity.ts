import { BotStatusChangedDto } from './../../multi-channel-chat/dto/channel-room/bot-status-changed.dto';
import { AreaCampaniaResponse } from '@modules/area-campania/entities/area-campania.entity';
import { EstadoCampania } from '@modules/estado-campania/entities/estado-campania.entity';
import { Horario } from '@modules/horario/entities/horario.entity';
import { TipoCampaniaResponse } from '@modules/tipo-campania/entities/tipo-campania.entity';
import { User } from '@modules/user/entities/user.entity';
import { Optional } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  DeletedAt,
  DefaultScope,
  Scopes,
} from 'sequelize-typescript';


export interface CampaniaAttributes {
  id: number;
  nombre: string;
  descripcion: string;
  id_tipo_campania: number;
  id_area_campania: number;
  id_estado_campania: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  fecha_vigencia?: Date;
  status?: boolean;
  deletedAt?: Date
  createUser?: number;
}

export type CampaniaCreationAttributes = Optional<
  CampaniaAttributes,
  'id'|'status'|'fecha_vigencia'|'fecha_inicio'|'fecha_fin' |'createUser'|'deletedAt'
>;
@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt'] }, 
}))
@Scopes(() => ({}))
@Table({
  tableName: 'gestion-campania',
  timestamps: true,
  paranoid: true,
})
export class GestionCampaniaResponse extends Model<CampaniaAttributes, CampaniaCreationAttributes>{

  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  nombre: string;

  @Column({ type: DataType.STRING, allowNull: true })
  descripcion: string;

  @ForeignKey(() => TipoCampaniaResponse)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_tipo_campania: number;
  
  @BelongsTo(() => TipoCampaniaResponse)
  tipoCampania: TipoCampaniaResponse;    

  @ForeignKey(() => AreaCampaniaResponse)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_area_campania: number;
  
  @BelongsTo(() => AreaCampaniaResponse)
  areaCampania: AreaCampaniaResponse; 

  @ForeignKey(() => EstadoCampania)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_estado_campania: number;
  
  @BelongsTo(() => EstadoCampania)
  estados: EstadoCampania;

  @Column({ type: DataType.DATE, allowNull: true })
  fecha_inicio: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  fecha_fin: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  fecha_vigencia: Date;
  
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  createUser: number;

  @Column({field: 'vc_campaign_id', type: DataType.STRING, allowNull: true })
  campaniaId: string;

 
  
  @BelongsTo(() => User)
  user: User;

  @Column({
      field: 'status',
      type: DataType.BOOLEAN,
      defaultValue: true,
      comment: 'Campo para habilitar o inhabilitar un registro',
  })
  status?: boolean;
  
  @DeletedAt
  declare deletedAt: Date;



}
