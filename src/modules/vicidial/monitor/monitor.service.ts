import { groupBy } from '@common/helpers/group.helper';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { EmailAttentionRepository } from '@modules/email/repositories/email-attention.repository';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { InboxCredentialRepository } from '@modules/inbox/repositories/inbox-credential.repository';
import { InboxUserRepository } from '@modules/inbox/repositories/inbox-user.repository';
import { ChannelAttentionStatus } from '@modules/multi-channel-chat/entities/channel-attention.entity';
import { ChannelRoom } from '@modules/multi-channel-chat/entities/channel-room.entity';
import { ChannelAttentionRepository } from '@modules/multi-channel-chat/repositories/channel-attention.repository';
import { ChannelMessageRepository } from '@modules/multi-channel-chat/repositories/channel-messages.repository';
import { Role } from '@modules/role/entities/role.entity';
import { User } from '@modules/user/entities/user.entity';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MonitorVicidialService } from './monitor-vicidial.service';
import { getDayMonth } from '@common/helpers/time.helper';
import { ChannelType } from '@common/interfaces/channel-connector/messaging.interface';
import { InboxCredential } from '@modules/inbox/entities/inbox-credential.entity';
import { EmailCredential } from '@modules/email/entities/email-credentials.entity';
import { ChannelEnum } from '@common/enums/channel.enum';
import { CallHistoryRepository } from '@modules/call/repositories/call-history.repository';
import { CallService } from '@modules/call/services/call.service';

@Injectable()
export class MonitorService {
  constructor(
    private readonly attentionRepository: ChannelAttentionRepository,
    private readonly mailAttentionRepository: EmailAttentionRepository,
    private readonly inboxUserRepository: InboxUserRepository,
    private readonly sequelize: Sequelize,
    private readonly inboxCredentialRepository: InboxCredentialRepository,
    private readonly channelMessageRepository: ChannelMessageRepository,
    private readonly vicidialService: MonitorVicidialService,
    private readonly userVicidialRepository: VicidialUserRepository,
    private readonly callService: CallService,
    @InjectConnection('central') private readonly db: Sequelize,
  ) {}

  getBaseInclude(channelId: number) {
    return {
      model: ChannelRoom,
      attributes: [],
      include: [
        {
          model: Inbox,
          attributes: [],
          include: [
            {
              model: Channel,
              attributes: [],
              where: { id: channelId },
            },
          ],
        },
      ],
    };
  }

  async channelBotCount(channelId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const baseInclude = this.getBaseInclude(channelId);
    const messages = await this.channelMessageRepository.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
      include: [baseInclude],
      attributes: [
        'channelRoomId',
        [
          this.sequelize.fn(
            'MAX',
            this.sequelize.literal(
              `CASE WHEN sender_type = 'bot' THEN 1 ELSE 0 END`,
            ),
          ),
          'hasBot',
        ],
        [
          this.sequelize.fn(
            'MAX',
            this.sequelize.literal(
              `CASE WHEN sender_type = 'agent' THEN 1 ELSE 0 END`,
            ),
          ),
          'hasAgent',
        ],
      ],
      group: ['channelRoomId'],
    });
    const channelRoomJson = messages.map((a) => a.toJSON() as any);
    return channelRoomJson;
  }

  async channelCount(channelId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const baseInclude = this.getBaseInclude(channelId);

    const total = await this.attentionRepository.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
      include: [baseInclude],
    });

    const complete = await this.attentionRepository.count({
      where: {
        status: ChannelAttentionStatus.CLOSED,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
      include: [baseInclude],
    });

    const inComplete = await this.attentionRepository.count({
      where: {
        status: ChannelAttentionStatus.IN_PROGRESS,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
      include: [baseInclude],
    });
    const inQueque = await this.attentionRepository.count({
      where: {
        status: ChannelAttentionStatus.IDENTITY_VERIFICATION,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
      include: [baseInclude],
    });
    const chatWSpCount = await this.channelBotCount(channelId);

    const { botCount, agentCount } = chatWSpCount.reduce(
      (acc, item) => {
        if (Number(item.hasBot) === 1) {
          acc.botCount++;
        }
        if (Number(item.hasAgent) === 1) {
          acc.agentCount++;
        }
        return acc;
      },
      { botCount: 0, agentCount: 0 },
    );
    return {
      total,
      complete,
      inComplete,
      inQueque,
      botCount,
      agentCount,
    };
  }

  async chatCount() {
    return await this.channelCount(7);
  }

  async wspCount() {
    return await this.channelCount(2);
  }

  async totalChat(
    userId: number,
    channelId: number,
    today: Date,
    tomorrow: Date,
  ) {
    const totalChat = await this.attentionRepository.count({
      where: {
        userId: userId,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
      include: [
        {
          model: ChannelRoom,
          attributes: [],
          include: [
            {
              model: Inbox,
              attributes: [],
              where: { channelId },
              required: true,
            },
          ],
        },
      ],
    });
    return totalChat;
  }

  async attentionDetail(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const recievedCount = await this.mailAttentionRepository.count({
      where: {
        advisorUserId: userId,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
    });
    const chat = await this.totalChat(userId, 7, today, tomorrow);
    const chatbot = await this.totalChat(userId, 4, today, tomorrow);
    let alosat: number = 0;
    const vicidialuser = await this.userVicidialRepository.findOne({
      where: { userId: userId },
    });

    console.log('vicidialuser', !!vicidialuser);
    if (vicidialuser) {
      const username = vicidialuser.toJSON().username;
      console.log('username', username);
      const { total } = await this.callService.getCallsCounterByNow(username);
      alosat = total;
    }
    const count = recievedCount + chat + chatbot + alosat;
    return { recievedCount, chat, chatbot, alosat, count };
  }

  async mailCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const recievedCount = await this.mailAttentionRepository.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
    });
    const attendedCount = await this.mailAttentionRepository.count({
      where: {
        assistanceStateId: 5,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
    });
    const notAttendedToday = await this.mailAttentionRepository.count({
      where: {
        assistanceStateId: { [Op.ne]: 5 },
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
    });
    const notAttendedYesterday = await this.mailAttentionRepository.count({
      where: {
        assistanceStateId: { [Op.ne]: 5 },
        createdAt: {
          [Op.gte]: yesterday,
          [Op.lt]: today,
        },
      } as any,
    });
    return {
      attendedCount,
      notAttendedToday,
      notAttendedYesterday,
      recievedCount,
    };
  }

  async attentionDate(dateVariable: Date) {
    const date = new Date(dateVariable);
    date.setHours(0, 0, 0, 0);
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    const nextDay = new Date(tomorrow);
    nextDay.setDate(tomorrow.getDate() + 1);
    const recievedToday = await this.mailAttentionRepository.count({
      where: {
        createdAt: {
          [Op.gte]: date,
          [Op.lt]: tomorrow,
        },
      } as any,
    });
    const recievedNext = await this.mailAttentionRepository.count({
      where: {
        createdAt: {
          [Op.gte]: tomorrow,
          [Op.lt]: nextDay,
        },
      } as any,
    });
    return {
      date: `${getDayMonth(date)}`,
      recieved: recievedToday + recievedNext,
      recievedToday: recievedToday,
      recievedNext: recievedNext,
    };
  }

  async getAdvisors(channelId: number) {
    const advisors = await this.inboxUserRepository.findAll({
      include: [
        {
          model: User,
          as: 'user',
          required: true,
          attributes: ['displayName'],
          include: [{ model: Role, where: { id: 3 }, attributes: [] }],
        },
        {
          model: Inbox,
          attributes: [],
          include: [
            {
              model: Channel,
              where: { id: channelId },
              attributes: [],
            },
          ],
        },
        {
          model: ChannelState,
          attributes: ['name'],
        },
      ],
      attributes: ['userId', 'updatedAt', 'inboxId'],
    });
    const advisorsJson = advisors.map((a) => a.toJSON());
    return advisorsJson;
  }

  async getMonitoringMultiChannel(channel: ChannelType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const advisors = await this.inboxUserRepository.findAll({
      include: [
        {
          model: User,
          as: 'user',
          required: true,
          attributes: ['id', 'displayName'],
          include: [{ model: Role, where: { id: 3 }, attributes: [] }],
        },
        {
          model: Inbox,
          as: 'inbox',
          required: true,
          attributes: ['id'],
          include: [
            {
              model: Channel,
              as: 'channel',
              where: { name: channel },
              required: true,
              attributes: ['name'],
            },
            {
              model: InboxCredential,
              attributes: ['phoneNumber'],
            },
          ],
        },
      ],
      attributes: ['userId', 'inboxId'],
    });

    // Obtener métricas para cada asesor
    const advisorsWithMetrics = await Promise.all(
      advisors.map(async (advisor) => {
        const advisorJson = advisor.toJSON();

        // Obtener todas las atenciones cerradas del asesor del día
        const attentions = await this.attentionRepository.findAll({
          include: [
            {
              model: ChannelRoom,
              required: true,
              where: {
                inboxId: advisorJson.inboxId,
              },
              attributes: [],
            },
          ],
          where: {
            userId: advisorJson.userId,
            status: ChannelAttentionStatus.CLOSED,
            createdAt: {
              [Op.gte]: today,
              [Op.lt]: tomorrow,
            },
            endDate: { [Op.ne]: null },
          },
          attributes: ['id', 'startDate', 'endDate'],
          raw: true,
        });

        let promedioAtencion = 0;
        let totalDurationMinutes = 0;

        if (attentions.length > 0) {
          // Filtrar solo las atenciones que tengan endDate válido
          const validAttentions = attentions.filter(
            (att) =>
              att.endDate instanceof Date || typeof att.endDate === 'string',
          );

          if (validAttentions.length > 0) {
            const totalMinutes = validAttentions.reduce((sum, att) => {
              const start = new Date(att.startDate);
              const end = att.endDate ? new Date(att.endDate) : null;

              if (!end || isNaN(end.getTime())) return sum; // ignora valores inválidos

              const duration = (end.getTime() - start.getTime()) / (1000 * 60);
              return sum + duration;
            }, 0);

            totalDurationMinutes = Math.round(totalMinutes);
            promedioAtencion = Math.round(
              totalMinutes / validAttentions.length,
            );
          }
        }

        // Contar total de atenciones del día (incluyendo en progreso)
        const AttentionsFilteredToday = await this.attentionRepository.findAll({
          include: [
            {
              model: ChannelRoom,
              required: true,
              where: {
                inboxId: advisorJson.inboxId,
              },
              attributes: [],
            },
          ],
          where: {
            userId: advisorJson.userId,
            createdAt: {
              [Op.gte]: today,
              [Op.lt]: tomorrow,
            },
          },
        });

        // Calcular efectividad (atenciones cerradas / total de atenciones del día)
        // const totalAttentions = AttentionsFilteredToday.length;
        const totalAttentions = new Set(
          AttentionsFilteredToday.map((a) => a.id),
        ).size;
        const efectividad =
          totalAttentions > 0
            ? Math.round((attentions.length / totalAttentions) * 100)
            : 0;

        const phoneNumber = advisorJson.inbox?.credentials?.phoneNumber ?? '';

        return {
          userId: advisorJson?.user?.id,
          channel: advisorJson.inbox?.channel?.name || channel,
          name: advisorJson?.user?.displayName,
          avgDurationMinutes: promedioAtencion,
          totalDurationMinutes,
          percentage: efectividad,
          attentionCount: totalAttentions,
          phoneNumber,
        };
      }),
    );
    return advisorsWithMetrics;
  }

  async getMailAdvisors() {
    const advisors = await this.getAdvisors(4);
    const attentionsGrouped = await this.mailAttentionRepository.findAll({
      attributes: ['advisorUserId', [this.sequelize.fn('COUNT', '*'), 'count']],
      group: ['advisor_user_id'],
    });
    const attentionsGroupedJson = attentionsGrouped.map((a) => a.toJSON());
    const attentionMap = attentionsGroupedJson.reduce(
      (acc, item) => {
        const key = item.advisorUserId ?? 'unassigned';
        acc[key] = Number(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );
    const totalAttentions: number = (
      Object.values(attentionMap) as number[]
    ).reduce((sum: number, count: number) => sum + count, 0);
    const advisorsResult = advisors.map((item) => {
      const attentionCount = attentionMap[item.userId] || 0;
      const updatedAtValue = item.updatedAt ?? 0;
      const diffMinutes = Math.floor(
        (Date.now() - new Date(updatedAtValue).getTime()) / (1000 * 60),
      );
      const percentage = Number(
        ((attentionCount / totalAttentions) * 100).toFixed(2),
      );
      return {
        ...item,
        attentionCount,
        minutesSinceUpdate: diffMinutes,
        percentage,
      };
    });
    return advisorsResult;
  }

  async getMonitoringEmailUsers() {
    const startDay = new Date();
    // startDay.setDate(startDay.getDate() - 1);
    startDay.setHours(0, 0, 0);
    const endDay = new Date();
    endDay.setHours(23, 59, 59);

    // Obtener todos los asesores con rol 3 que tengan inbox de email
    const advisors = await this.inboxUserRepository.findAll({
      include: [
        {
          model: User,
          as: 'user',
          required: true,
          attributes: ['id', 'displayName'],
          include: [Role],
        },
        {
          model: Inbox,
          as: 'inbox',
          where: { channelId: ChannelEnum.EMAIL },
          required: true,
          attributes: ['id', 'channelId'],
        },
      ],
      attributes: ['userId', 'inboxId', 'channelStateId', 'updatedAt'],
    });

    // Obtener métricas para cada asesor
    const advisorsWithMetrics = await Promise.all(
      advisors.map(async (advisor) => {
        const advisorJson = advisor.toJSON();

        // Obtener todas las atenciones cerradas del asesor del día
        const closedAttentions = await this.mailAttentionRepository.findAll({
          where: {
            advisorUserId: advisorJson.userId,
            advisorInboxId: advisorJson.inboxId,
            closedAt: { [Op.ne]: null } as any,
            createdAt: {
              [Op.between]: [startDay, endDay],
            },
          },
          attributes: ['id', 'createdAt', 'closedAt'],
          raw: true,
        });

        let avgStateTime = 0;
        let totalDurationMinutes = 0;

        if (closedAttentions.length > 0) {
          const validAttentions = closedAttentions.filter(
            (att) =>
              att.closedAt instanceof Date || typeof att.closedAt === 'string',
          );

          if (validAttentions.length > 0) {
            const totalMinutes = validAttentions.reduce((sum, att) => {
              const created = new Date(att.createdAt);
              const closed = att.closedAt ? new Date(att.closedAt) : null;

              if (!closed || isNaN(closed.getTime())) return sum;

              const duration =
                (closed.getTime() - created.getTime()) / (1000 * 60);
              return sum + duration;
            }, 0);

            totalDurationMinutes = Math.round(totalMinutes);
            avgStateTime = Math.round(totalMinutes / validAttentions.length);
          }
        }

        // Contar total de atenciones del día
        const allAttentionsToday = await this.mailAttentionRepository.findAll({
          where: {
            advisorUserId: advisorJson.userId,
            advisorInboxId: advisorJson.inboxId,
            createdAt: {
              [Op.between]: [startDay, endDay],
            },
          },
        });

        const totalAttentions = allAttentionsToday.length;

        const closed = closedAttentions.length;

        // Calcular efectividad (atenciones cerradas / total de atenciones del día)
        const effectiveness =
          totalAttentions > 0
            ? Math.round((closed / totalAttentions) * 100)
            : 0;

        const email =
          advisorJson.inbox?.emailCredentials?.[0]?.email ??
          advisorJson.inbox?.emailCredentials?.email ??
          '';

        return {
          userId: advisorJson.user?.id,
          channelStateId: advisorJson.channelStateId,
          displayName: advisorJson.user?.displayName,
          avgStateTimeMinutes: avgStateTime,
          totalDurationMinutes,
          closedAttentions: closed,
          percentage: effectiveness,
          attentionCount: totalAttentions,
          email,
        };
      }),
    );

    return advisorsWithMetrics;
  }

  async getChatAdvisors() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const advisors = await this.getAdvisors(7);
    const assistanceGrouped = await this.attentionRepository.findAll({
      attributes: [
        [this.sequelize.col('channelRoom.user_id'), 'user_id'],
        [
          this.sequelize.fn('COUNT', this.sequelize.col('ChannelAttention.id')),
          'count',
        ],
        [
          this.sequelize.fn(
            'AVG',
            this.sequelize.literal(
              'TIMESTAMPDIFF(SECOND, `ChannelAttention`.`start_date`, `ChannelAttention`.`end_date`)',
            ),
          ),
          'avgDuration',
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
        endDate: { [Op.ne]: null },
      },
      include: [
        {
          model: ChannelRoom,
          required: true,
          attributes: [],
        },
      ],
      group: ['channelRoom.user_id'],
    });
    const asistanceGroupedJson = assistanceGrouped.map(
      (a) => a.toJSON() as any,
    );
    const assistanceMap = asistanceGroupedJson.reduce(
      (acc, item) => {
        acc[item.user_id] = {
          count: Number(item.count),
          avgDuration: Number(item.avgDuration),
        };
        return acc;
      },
      {} as Record<string, { count: number; avgDuration: number }>,
    );
    const totalAttentions: number = (
      Object.values(assistanceMap) as { count: number; avgDuration: number }[]
    ).reduce((sum, item) => sum + item.count, 0);
    const advisorsResult = advisors.map((item) => {
      const attentionData = assistanceMap[item.userId] || {
        count: 0,
        avgDuration: 0,
      };
      const updatedAtValue = item.updatedAt ?? 0;
      const diffMinutes = Math.floor(
        (Date.now() - new Date(updatedAtValue).getTime()) / (1000 * 60),
      );
      const percentage =
        totalAttentions > 0
          ? Number(((attentionData.count / totalAttentions) * 100).toFixed(2))
          : 0;
      return {
        ...item,
        attentionCount: attentionData.count,
        minutesSinceUpdate: diffMinutes,
        avgDurationMinutes: Math.round(attentionData.avgDuration / 60),
        percentage,
      };
    });
    return advisorsResult;
  }

  async chatWspAdvisors() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const advisors = await this.getAdvisors(2);
    const inboxIds = advisors.map((a) => a.idInbox);
    const inboxCredentials = await this.inboxCredentialRepository.findAll({
      where: {
        inboxId: { [Op.in]: inboxIds },
      },
    });
    const credentialsJson = inboxCredentials.map((a) => a.toJSON());
    const inboxDict = credentialsJson.reduce(
      (acc, cred) => {
        acc[cred.inboxId] = cred.phoneNumber!;
        return acc;
      },
      {} as Record<number, string>,
    );
    const assistanceGrouped = await this.attentionRepository.findAll({
      attributes: [
        [this.sequelize.col('user_id'), 'userId'],
        [
          this.sequelize.fn('COUNT', this.sequelize.col('ChannelAttention.id')),
          'count',
        ],
        [
          this.sequelize.fn(
            'AVG',
            this.sequelize.literal(
              'TIMESTAMPDIFF(SECOND, `ChannelAttention`.`start_date`, `ChannelAttention`.`end_date`)',
            ),
          ),
          'avgDuration',
        ],
        [
          this.sequelize.fn(
            'SUM',
            this.sequelize.literal(
              'TIMESTAMPDIFF(SECOND, `ChannelAttention`.`start_date`, `ChannelAttention`.`end_date`)',
            ),
          ),
          'totalDuration',
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
        endDate: { [Op.ne]: null },
      },
      include: [
        {
          model: ChannelRoom,
          required: true,
          attributes: [],
        },
      ],
      group: ['user_id'],
    });
    const asistanceGroupedJson = assistanceGrouped.map(
      (a) => a.toJSON() as any,
    );
    const assistanceMap = asistanceGroupedJson.reduce(
      (acc, item) => {
        acc[item.userId] = {
          count: Number(item.count),
          avgDuration: Number(item.avgDuration),
          totalDuration: Number(item.totalDuration),
        };
        return acc;
      },
      {} as Record<
        number,
        { count: number; avgDuration: number; totalDuration: number }
      >,
    );
    const totalAttentions: number = (
      Object.values(assistanceMap) as {
        count: number;
        avgDuration: number;
        totalDuration: number;
      }[]
    ).reduce((sum, item) => sum + item.count, 0);
    const advisorsResult = advisors.map((item) => {
      const attentionData = assistanceMap[item.userId] || {
        count: 0,
        avgDuration: 0,
        totalDuration: 0,
      };
      const updatedAtValue = item.updatedAt ?? 0;
      const diffMinutes = Math.floor(
        (Date.now() - new Date(updatedAtValue).getTime()) / (1000 * 60),
      );
      const percentage =
        totalAttentions > 0
          ? Number(((attentionData.count / totalAttentions) * 100).toFixed(2))
          : 0;
      return {
        ...item,
        attentionCount: attentionData.count,
        minutesSinceUpdate: diffMinutes,
        avgDurationMinutes: Math.round(attentionData.avgDuration / 60),
        totalDurationMinutes: Math.round(attentionData.totalDuration / 60),
        phoneNumber: inboxDict[item.idInbox],
        percentage,
      };
    });
    return advisorsResult;
  }
}
