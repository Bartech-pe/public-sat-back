import { MailFilter } from './dto/mail-filter.dto';
import { EmailAttention } from './entities/email-attention.entity';
import { Op } from 'sequelize';
import { MailType } from './enum/mail-type.enum';
import { EmailThreadRepository } from './repositories/email-thread.repository';
import { EmailThread } from './entities/email-thread.entity';
import { User } from '@modules/user/entities/user.entity';
import { AssistanceState } from '@modules/assistance-state/entities/assistance-state.entity';

export const EmailTicketList = async (
  whereThread: any,
  query: MailFilter,
  emailThreadRepository: EmailThreadRepository,
) => {
  if (query.contains) {
    whereThread.content = { [Op.like]: `%${query.contains}%` };
  }
  if (query.notContains) {
    whereThread.content = { [Op.notLike]: `%${query.notContains}%` };
  }
  if (query.type) {
    whereThread.type = query.type;
  }
  if (query.date) {
    const dateFilter = new Date(query.date);
    dateFilter.setHours(0, 0, 0, 0);
    const finishDate = new Date(dateFilter);
    finishDate.setDate(finishDate.getDate() + 1);
    whereThread.createdAt = {
      [Op.gte]: dateFilter,
      [Op.lt]: finishDate,
    };
  }
  const whereAttention: any = {};
  if (query.stateId) {
    whereAttention.stateId = query.stateId;
  }
  if (query.advisorEmailId) {
    whereAttention.advisorUserId = query.advisorEmailId;
  }
  if (query.from) {
    whereAttention.emailCitizen = { [Op.like]: `%${query.from}%` };
  }

  const tickets = await emailThreadRepository.findAll({
    attributes: [
      'mailAttentionId',
      'subject',
      'content',
      'name',
      'createdAt',
      'id',
    ],
    where: whereThread,
    include: [
      {
        model: EmailAttention,
        where: whereAttention,
        attributes: ['ticketCode', 'emailCitizen', 'assistanceStateId'],
        include: [
          {
            model: User,
            as: 'advisor',
          },
          AssistanceState,
        ],
      },
    ],
    order: [['id', 'DESC']],
  });
  const ticketsData: EmailThread[] = tickets.map((a) => a.toJSON());

  const ticketsJson = ticketsData.map((json) => {
    return {
      id: json.id,
      subject: json.subject,
      content: json.content,
      mailAttentionId: json.mailAttentionId,
      ticketCode: json.emailAttention.ticketCode,
      from: json.emailAttention.emailCitizen,
      name: json.name,
      state: json.emailAttention.assistanceState,
      advisor: json.emailAttention?.advisor?.name,
      createdAt: json.createdAt,
    };
  });
  return ticketsJson;
};

export const GetTypeEmail = (type: MailType) => {
  switch (type) {
    case MailType.ADVISOR:
      return 'ASESOR';
    case MailType.CITIZEN:
      return 'CIUDADANO';
    case MailType.INTERN_REPLY:
      return 'RESPUESTA_INTERNA';
    case MailType.INTERN_FORWARD:
      return 'REENVIO_INTERNO';
    default:
      return 'SIN_TIPO';
  }
};
