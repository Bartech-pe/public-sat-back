import {
  BeforeUpdate,
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
  HasMany,
  AfterCreate,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { VicidialUserHistory } from './vicidial-user-history.model';
import { Op } from 'sequelize';

@DefaultScope(() => ({
  attributes: { exclude: ['deletedAt', 'deletedBy'] },
}))
@Scopes(() => ({}))
@Table({
  tableName: 'vicidial_users',
  timestamps: true,
  paranoid: true,
})
export class VicidialUser extends Model {
  @Column({
    field: 'id',
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    field: 'username',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Username del agente en Vicidial',
  })
  username: string;

  @Column({
    field: 'user_password',
    type: DataType.STRING,
    allowNull: false,
    comment: 'Password de usuario en Vicidial',
  })
  userPass: string;

  @Column({
    field: 'phone_login',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Extensión/teléfono del agente',
  })
  phoneLogin: string;

  @Column({
    field: 'phone_password',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Password del teléfono SIP',
  })
  phonePass: string;

  @Column({
    field: 'user_level',
    type: DataType.TINYINT,
    allowNull: true,
    comment: 'Nivel de usuario (1=agente, 9=admin)',
  })
  userLevel: number;

  @Column({
    field: 'user_group',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Grupo del usuario (ej: AGENTS)',
  })
  userGroup: string;

  @ForeignKey(() => User)
  @Column({ field: 'user_id', allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => ChannelState)
  @Column({
    field: 'channel_state_id',
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Id Estado de canal asignado al asesor',
  })
  channelStateId?: number;

  @BelongsTo(() => ChannelState)
  channelState: ChannelState;

  @Column({
    field: 'pause_code',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Código de pausa vicidial',
  })
  pauseCode: string | null;

  @Column({
    field: 'inbound_groups',
    type: DataType.STRING,
    allowNull: true,
    comment: 'Inbound groups asignados',
  })
  inboundGroups: string | null;

  @HasMany(() => VicidialUserHistory)
  history?: VicidialUserHistory[];

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

  // ========================================================
  // HOOK: Registrar historial al CREAR un usuario
  // ========================================================
  @AfterCreate
  static async registerInitialHistory(vUser: VicidialUser) {
    try {
      await VicidialUserHistory.create({
        vicidialUserId: vUser.toJSON().id,
        oldChannelStateId: null,
        newChannelStateId: vUser.toJSON().channelStateId ?? null,
        oldPauseCode: null,
        newPauseCode: vUser.toJSON().pauseCode ?? null,
        startTime: new Date(),
      });
    } catch (err) {
      console.error('Error al registrar historial inicial:', err);
    }
  }

  // ========================================================
  // HOOK: Registrar historial al ACTUALIZAR usuario
  // ========================================================
  @BeforeUpdate
  static async registerHistory(vUser: VicidialUser) {
    const changed = vUser.changed();
    const instance = vUser?.toJSON();
    if (!changed) return;

    const hasStateChange =
      changed.includes('channelStateId') ||
      changed.includes('channel_state_id');
    const hasPauseChange =
      changed.includes('pauseCode') || changed.includes('pause_code');

    if (!hasStateChange && !hasPauseChange) return;

    const previous = await VicidialUser.findByPk(instance.id, { raw: true });
    if (!previous) return;

    // 🔹 Cerrar último historial activo
    const lastHistory = await VicidialUserHistory.findOne({
      where: {
        vicidialUserId: instance.id,
        endTime: { [Op.is]: null },
      },
      order: [['startTime', 'DESC']],
    });

    if (lastHistory) {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - lastHistory.toJSON().startTime.getTime()) / 1000,
      );
      await lastHistory.update({ endTime, duration });
    }

    // 🔹 Crear nuevo registro de historial
    await VicidialUserHistory.create({
      vicidialUserId: instance.id,
      oldChannelStateId: previous.channelStateId,
      newChannelStateId: instance.channelStateId,
      oldPauseCode: previous.pauseCode,
      newPauseCode: instance.pauseCode,
      startTime: new Date(),
    });
  }
}
