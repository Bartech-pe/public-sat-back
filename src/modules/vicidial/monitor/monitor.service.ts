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
    const assitances = await this.attentionRepository.findAll({
      attributes: ['channelRoomId'],
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
      include: [baseInclude],
    });
    const channelRoomIds = assitances.map((a) => a.toJSON().channelRoomId);
    const messages = await this.channelMessageRepository.findAll({
      where: {
        channelRoomId: { [Op.in]: channelRoomIds },
      },
      attributes: [
        'channelRoomId',
        [
          this.sequelize.fn(
            'MAX',
            this.sequelize.literal(
              `CASE WHEN senderType = 'bot' THEN 1 ELSE 0 END`,
            ),
          ),
          'hasBot',
        ],
        [
          this.sequelize.fn(
            'MAX',
            this.sequelize.literal(
              `CASE WHEN senderType = 'agent' THEN 1 ELSE 0 END`,
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
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
      include: [
        {
          model: ChannelRoom,
          where: { userId: userId },
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
    if (vicidialuser) {
      const username = vicidialuser.toJSON().username;
      const total = await this.vicidialService.vicidialCount(username);
      alosat = total.total;
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
        stateId: 5,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
    });
    const notAttendedToday = await this.mailAttentionRepository.count({
      where: {
        stateId: { [Op.ne]: 5 },
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      } as any,
    });
    const notAttendedYesterday = await this.mailAttentionRepository.count({
      where: {
        stateId: { [Op.ne]: 5 },
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
      attributes: ['userId', 'updatedAt', 'idInbox'],
    });
    const advisorsJson = advisors.map((a) => a.toJSON());
    return advisorsJson;
  }

  async getMailAdvisors() {
    const advisors = await this.getAdvisors(4);
    const attentionsGrouped = await this.mailAttentionRepository.findAll({
      attributes: ['advisorUserId', [this.sequelize.fn('COUNT', '*'), 'count']],
      group: ['advisorUserId'],
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

  async getChatAdvisors() {
    const advisors = await this.getAdvisors(7);
    const assistanceGrouped = await this.attentionRepository.findAll({
      attributes: [
        [this.sequelize.col('channelRoom.userId'), 'userId'],
        [
          this.sequelize.fn('COUNT', this.sequelize.col('ChannelAttention.id')),
          'count',
        ],
        [
          this.sequelize.fn(
            'AVG',
            this.sequelize.literal(
              'TIMESTAMPDIFF(SECOND, `ChannelAttention`.`startDate`, `ChannelAttention`.`endDate`)',
            ),
          ),
          'avgDuration',
        ],
      ],
      where: {
        endDate: { [Op.ne]: null },
      },
      include: [
        {
          model: ChannelRoom,
          attributes: [],
        },
      ],
      group: ['channelRoom.userId'],
    });
    const asistanceGroupedJson = assistanceGrouped.map(
      (a) => a.toJSON() as any,
    );
    const assistanceMap = asistanceGroupedJson.reduce(
      (acc, item) => {
        acc[item.userId] = {
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
      const attentionCount = assistanceMap[item.userId] || 0;
      const updatedAtValue = item.updatedAt ?? 0;
      const diffMinutes = Math.floor(
        (Date.now() - new Date(updatedAtValue).getTime()) / (1000 * 60),
      );
      const percentage = Number(
        ((attentionCount.count / totalAttentions) * 100).toFixed(2),
      );
      return {
        ...item,
        attentionCount: attentionCount.count,
        minutesSinceUpdate: diffMinutes,
        avgDurationMinutes: Math.round(attentionCount.avgDuration / 60),
        percentage,
      };
    });
    return advisorsResult;
  }
  async chatWspAdvisors() {
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
        [this.sequelize.col('channelRoom.userId'), 'userId'],
        [
          this.sequelize.fn('COUNT', this.sequelize.col('ChannelAttention.id')),
          'count',
        ],
        [
          this.sequelize.fn(
            'AVG',
            this.sequelize.literal(
              'TIMESTAMPDIFF(SECOND, `ChannelAttention`.`startDate`, `ChannelAttention`.`endDate`)',
            ),
          ),
          'avgDuration',
        ],
        [
          this.sequelize.fn(
            'SUM',
            this.sequelize.literal(
              'TIMESTAMPDIFF(SECOND, `ChannelAttention`.`startDate`, `ChannelAttention`.`endDate`)',
            ),
          ),
          'totalDuration',
        ],
      ],
      where: {
        endDate: { [Op.ne]: null },
      },
      include: [
        {
          model: ChannelRoom,
          attributes: [],
        },
      ],
      group: ['channelRoom.userId'],
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
      {} as Record<string, { count: number; avgDuration: number }>,
    );
    const totalAttentions: number = (
      Object.values(assistanceMap) as { count: number; avgDuration: number }[]
    ).reduce((sum, item) => sum + item.count, 0);
    const advisorsResult = advisors.map((item) => {
      const attentionCount = assistanceMap[item.userId] || 0;
      const updatedAtValue = item.updatedAt ?? 0;
      const diffMinutes = Math.floor(
        (Date.now() - new Date(updatedAtValue).getTime()) / (1000 * 60),
      );
      const percentage = Number(
        ((attentionCount.count / totalAttentions) * 100).toFixed(2),
      );
      return {
        ...item,
        attentionCount: attentionCount.count,
        minutesSinceUpdate: diffMinutes,
        avgDurationMinutes: Math.round(attentionCount.avgDuration / 60),
        totalDurationMinutes: Math.round(attentionCount.totalDuration / 60),
        phoneNumber: inboxDict[item.idInbox],
        percentage,
      };
    });
    return advisorsResult;
  }
}
