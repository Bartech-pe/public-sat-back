import {
  Table,
  Column,
  Model,
  ForeignKey,
  DeletedAt,
  BelongsTo,
  DataType,
  CreatedAt,
  UpdatedAt,
  AfterCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import { User } from '@modules/user/entities/user.entity';
import { Inbox } from './inbox.entity';
import { ChannelState } from '@modules/custom-states/channel-state/entities/channel-state.entity';
import { ChannelStateUserHistory } from './channel-state-user-history.model';
import { OfflineEnumToChannel } from '@common/enums/channel-state.enum';
import { Op } from 'sequelize';

@Table({
  tableName: 'inbox_users',
  timestamps: true,
  paranoid: true,
})
export class InboxUser extends Model {
  @ForeignKey(() => Inbox)
  @Column({
    field: 'inbox_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id del equipo',
  })
  inboxId: number;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    comment: 'Id del usuario',
  })
  userId: number;

  @BelongsTo(() => User, { foreignKey: 'userId' })
  user: User;

  @BelongsTo(() => Inbox, { foreignKey: 'inboxId' })
  inbox: Inbox;

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
  static async registerInitialHistory(inboxUser: InboxUser) {
    try {
      const inbox = await Inbox.findByPk(inboxUser.toJSON().inboxId, {
        raw: true,
      });

      if (!inbox) return;

      const channelStateId = OfflineEnumToChannel[inbox!.channelId];
      await ChannelStateUserHistory.create({
        userId: inboxUser.toJSON().userId,
        inboxId: inboxUser.toJSON().inboxId,
        oldChannelStateId: channelStateId,
        newChannelStateId: inboxUser.toJSON().channelStateId ?? null,
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
  static async registerHistory(inboxUser: InboxUser) {
    const changed = inboxUser.changed();
    const instance = inboxUser?.toJSON();

    if (!changed) return;

    const hasStateChange =
      changed.includes('channelStateId') ||
      changed.includes('channel_state_id');

    if (!hasStateChange) return;

    const previous = await InboxUser.findOne({
      where: { userId: instance.userId, inboxId: instance.inboxId },
      raw: true,
    });
    if (!previous) return;

    // 🔹 Cerrar último historial activo
    const lastHistory = await ChannelStateUserHistory.findOne({
      where: {
        userId: instance.userId,
        inboxId: instance.inboxId,
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

    const inbox: Inbox | undefined = (
      await Inbox.findByPk(inboxUser.toJSON().inboxId)
    )?.toJSON();
    const channelStateId = OfflineEnumToChannel[inbox!.channelId];

    // 🔹 Crear nuevo registro de historial
    await ChannelStateUserHistory.create({
      userId: instance.userId,
      inboxId: instance.inboxId,
      oldChannelStateId: previous.channelStateId ?? channelStateId,
      newChannelStateId: instance.channelStateId,
      startTime: new Date(),
    });
  }
}
