import { FindOptions, literal, Op, WhereOptions } from 'sequelize';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EmailAttentionRepository } from '../repositories/email-attention.repository';
import { AssistanceStateService } from '@modules/custom-states/assistance-state/assistance-state.service';
import { ReplyCenterMail } from '../dto/reply-center-mail.dto';
import { EmailAttention } from '../entities/email-attention.entity';
import { MailFilter } from '../dto/mail-filter.dto';
import { EmailStateRepository } from '../repositories/email-state.repository';
import { EmailTicketList } from '../email-ticket-list';
import { RequestContextService } from '@common/context/request-context.service';
import { EmailChannelService } from './email-channel.service';
import { ReplyEmail } from '../dto/email-channel/reply-email.dto';
import { ForwardTo } from '../dto/email-channel/forward-to.dto';
import { ForwardCenterMail } from '../dto/forward-center-mail.dto';
import { InboxUserRepository } from '@modules/inbox/repositories/inbox-user.repository';
import { CenterEmail } from '../dto/center-email.dto';
import {
  AttachementBody,
  BuildCenterEmail,
  FileEmail,
} from '../dto/build-email.dto';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { EmailCredentialRepository } from '../repositories/email-credential.repository';
import { MailType } from '../enum/mail-type.enum';
import { EmailThreadRepository } from '../repositories/email-thread.repository';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { User } from '@modules/user/entities/user.entity';
import { EmailThread } from '../entities/email-thread.entity';
import { UserRole } from '@common/constants/role.constant';
import { AssistanceState } from '@modules/custom-states/assistance-state/entities/assistance-state.entity';
import { ChannelEnum } from '@common/enums/channel.enum';
import { EmailGateway } from '../email.gateway';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { EmailAttachment } from '../entities/email-attachment.entity';
import { CitizenService } from '@modules/citizen/services/citizen.service';
import { MailStates } from '@common/enums/assistance-state.enum';
import { emailAvailableStateId } from '@common/constants/channel.constant';
import { InboxUser } from '@modules/inbox/entities/inbox-user.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class EmailCenterService {
  constructor(
    private readonly emailAttentionRepository: EmailAttentionRepository,
    private readonly assistanceStateService: AssistanceStateService,
    private readonly emailThreadRepository: EmailThreadRepository,
    private readonly emailStateRepository: EmailStateRepository,
    private readonly emailChannelService: EmailChannelService,
    private readonly inboxUserRepository: InboxUserRepository,
    private readonly emailCredentialRepository: EmailCredentialRepository,
    private readonly inboxRepository: InboxRepository,
    @Inject(forwardRef(() => EmailGateway))
    private readonly emailGateway: EmailGateway,
    private readonly citizenService: CitizenService,
    private readonly sequelize: Sequelize,
  ) {}

  async getTickets(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<any>> {
    const from = q?.from;

    const to = q?.to;

    const contains = q?.contains;

    const startDate = q?.startDate;

    const endDate = q?.endDate;

    const type = q?.type;

    const userIds = q?.userIds;

    const stateId = q?.stateId;

    const isAdvisor = user.roleId == UserRole.Ase;

    // 🔹 Filtros principales sobre EmailAttention
    const where: WhereOptions = {
      ...(isAdvisor ? { advisorUserId: user.id } : {}),
      ...(stateId
        ? { assistanceStateId: stateId }
        : {
            assistanceStateId: {
              [Op.notIn]: [MailStates.SPAM, MailStates.CLOSED],
            },
          }),
      ...(type ? { type } : {}),
      ...(userIds
        ? {
            advisorUserId: {
              [Op.in]: userIds,
            },
          }
        : {}),
    };

    // 🔹 Filtros sobre EmailThread (usaremos include con condiciones)
    const threadWhere: WhereOptions = {
      ...(from ? { from: { [Op.like]: `%${from}%` } } : {}),
      ...(to ? { to: { [Op.like]: `%${to}%` } } : {}),
      ...(contains
        ? {
            [Op.or]: [
              { subject: { [Op.like]: `%${contains}%` } },
              { content: { [Op.like]: `%${contains}%` } },
            ],
          }
        : {}),
      ...(startDate && endDate
        ? {
            date: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          }
        : startDate
          ? { date: { [Op.gte]: new Date(startDate) } }
          : endDate
            ? { date: { [Op.lte]: new Date(endDate) } }
            : {}),
    };

    const result = await this.emailAttentionRepository.findAndCountAll({
      attributes: {
        include: [
          [
            literal(`(
              SELECT \`subject\`
              FROM \`email_threads\`
              WHERE \`email_threads\`.\`email_attention_id\` = \`EmailAttention\`.\`id\`
              ORDER BY \`id\` ASC
              LIMIT 1
            )`),
            'subject',
          ],
          [
            literal(`(
              SELECT \`from\`
              FROM \`email_threads\`
              WHERE \`email_threads\`.\`email_attention_id\` = \`EmailAttention\`.\`id\`
              ORDER BY \`id\` ASC
              LIMIT 1
            )`),
            'from',
          ],
          [
            literal(`(
              SELECT \`name\`
              FROM \`email_threads\`
              WHERE \`email_threads\`.\`email_attention_id\` = \`EmailAttention\`.\`id\`
              ORDER BY \`id\` ASC
              LIMIT 1
            )`),
            'name',
          ],
        ],
      },
      where: where,
      include: [
        {
          model: EmailThread,
          attributes: [
            'id',
            'subject',
            'from',
            'name',
            'to',
            'toName',
            'date',
            'content',
            'type',
            'mailStateId',
            'isRead',
            'createdAt',
          ],
          where: Object.keys(threadWhere).length ? threadWhere : undefined,
          include: [
            {
              model: EmailAttachment,
              attributes: [
                'id',
                'attachmentGmailId',
                'cid',
                'filename',
                'mimeType',
                'publicUrl',
              ],
              required: false,
            },
          ],
          required: true,
          order: [['id', 'DESC']],
        },
        {
          model: User,
          as: 'advisor',
        },
        {
          model: AssistanceState,
        },
      ],
      distinct: true,
      order: [['id', 'DESC']],
      limit,
      offset,
    });

    return {
      ...result,
      data: result.data
        .map((r) => r.toJSON())
        .filter((r) => r.threads.length)
        .map((r: any) => {
          const threads = [...r.threads].sort((a, b) => b.id - a.id);

          const firstThread = [...r.threads].sort((a, b) => a.id - b.id);

          return {
            id: r.id,
            from: r.from,
            to: threads[0].to,
            toName: threads[0].toName,
            date: threads[0].date,
            subject: r.subject,
            content: threads[0].content,
            ticketCode: r.ticketCode,
            name: r.name,
            state: r.assistanceState,
            attachments: threads[0].attachments,
            advisor: r.advisor,
            isSender: firstThread[0].type === MailType.ADVISOR,
            isRead: threads[0].isRead,
            createdAt: threads[0].createdAt,
            firstThread: r.firstThread,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    };
  }

  async CloseTicket(mailAttentionId: number) {
    const exist = await this.emailAttentionRepository.findById(mailAttentionId);
    if (!exist) {
      throw new NotFoundException('No se encontro el ticket');
    }
    const state = await this.assistanceStateService.getClosedMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    const date = new Date();
    const updated = await this.emailAttentionRepository.update(
      mailAttentionId,
      {
        assistanceStateId: state.toJSON().id,
        closedAt: date,
      },
    );
    this.emailGateway.notifyEmailRequest();
    return { status: 'Success', message: 'Ticket Cerrado' };
  }

  async closeTicketMultiple(mailAttentionIds: number[]) {
    const state = await this.assistanceStateService.getClosedMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    await Promise.all(
      mailAttentionIds.map((mailAttentionId) =>
        this.emailAttentionRepository.update(mailAttentionId, {
          assistanceStateId: state.toJSON().id,
          closedAt: new Date(),
        }),
      ),
    );
    this.emailGateway.notifyEmailRequest();

    return { status: 'Success', message: 'Ticket Cerrado' };
  }

  async attentionTicket(mailAttentionIds: number[]) {
    const existAttentions = await this.emailAttentionRepository.findAll({
      where: {
        id: {
          [Op.in]: mailAttentionIds,
        },
      },
    });
    if (!existAttentions) {
      throw new NotFoundException('No se encontro el ticket');
    }
    const state = await this.assistanceStateService.getAttentionMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    for (const attention of existAttentions) {
      await attention.update({
        assistanceStateId: state.toJSON().id,
      });
    }

    this.emailGateway.notifyEmailRequest();
    return { status: 'Success', message: 'Ticket en Atención' };
  }
  async noWisTicket(mailAttentionIds: number[]) {
    const existAttentions = await this.emailAttentionRepository.findAll({
      where: {
        id: {
          [Op.in]: mailAttentionIds,
        },
      },
    });
    if (!existAttentions) {
      throw new NotFoundException('No se encontro el ticket');
    }
    const state = await this.assistanceStateService.getSpamMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    for (const attention of existAttentions) {
      await attention.update({
        assistanceStateId: state.toJSON().id,
      });
    }
    this.emailGateway.notifyEmailRequest();
    return { status: 'Success', message: 'Ticket en Atención' };
  }
  async RespondMail(body: ReplyCenterMail) {
    const { threadId, mailAttentionId } = body;

    let mailThread;
    if (!threadId) {
      const mailThreads = await this.emailThreadRepository.findAll({
        where: { mailAttentionId: mailAttentionId },
        order: [['createdAt', 'ASC']],
        include: [{ model: EmailAttention, attributes: ['mailThreadId'] }],
      });
      mailThread = mailThreads[0];
    } else {
      mailThread = await this.emailThreadRepository.findOne({
        where: { id: threadId },
        include: [{ model: EmailAttention, attributes: ['mailThreadId'] }],
      });
    }
    if (!mailThread)
      throw new NotFoundException('No se encontro el hilo del correo');
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          required: true,
          where: { channelId: ChannelEnum.EMAIL },
        },
      ],
    });
    if (!credential)
      throw new NotFoundException('No se encontro la credencial');
    const mailthreadJson: EmailThread = mailThread.toJSON();
    const messageId = mailthreadJson.messageGmailId;
    const request: ReplyEmail = {
      messageId: messageId,
      content: body.content,
      threadId: mailthreadJson.emailAttention.mailThreadId,
      clientId: credential.toJSON().clientID,
      email: credential.toJSON().email,
    };

    await this.emailChannelService.replyEmail(request);
  }

  async ForwardTo(body: ForwardCenterMail) {
    const mailAttentionId = body.mailAttentionId;
    const mailThreads = await this.emailThreadRepository.findAll({
      where: { mailAttentionId: mailAttentionId },
      order: [['createdAt', 'ASC']],
      include: [{ model: EmailAttention, attributes: ['mailThreadId'] }],
    });
    const mailThread = mailThreads[0];
    if (!mailThread)
      throw new NotFoundException('No se encontro el hilo del correo');
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          required: true,
          where: { channelId: ChannelEnum.EMAIL },
        },
      ],
    });
    if (!credential)
      throw new NotFoundException('No se encontro la credencial');
    const mailthreadJson = mailThread.toJSON();
    const messageId = mailthreadJson.messageGmailId;
    const request: ForwardTo = {
      messageId: messageId,
      forwardTo: body.from,
      message: body.message,
      clientId: credential.toJSON().clientID,
      email: credential.toJSON().email,
    };
    await this.emailChannelService.forwardTo(request);
    const state = await this.assistanceStateService.getPenddingMailState();
    if (!state) throw new NotFoundException('estado no encontrado');
    await this.emailAttentionRepository.update(mailAttentionId, {
      assistanceStateId: state.toJSON().id,
    });
  }

  async GetTicketsByAdvisorEmailId(query: MailFilter) {
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: send.toJSON().id,
    };
    const fullUser = RequestContextService.get<any>('user');
    if (fullUser.roleId == UserRole.Ase) {
      query.userId = fullUser.id;
    }
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }

  async getTicketsOpen(query: MailFilter) {
    const state = await this.assistanceStateService.getOpenMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    query.stateId = state.toJSON().id;
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: send.toJSON().id,
    };
    const fullUser = RequestContextService.get<any>('user');
    if (fullUser.roleId == UserRole.Ase) {
      query.userId = fullUser.id;
    }
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async getTicketsClose(query: MailFilter) {
    const state = await this.assistanceStateService.getClosedMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    query.stateId = state.toJSON().id;
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: send.toJSON().id,
    };
    const fullUser = RequestContextService.get<any>('user');
    if (fullUser.role.name == 'asesor') {
      query.userId = fullUser.id;
    }
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async getTicketsNoAdvisor(query: MailFilter) {
    const state = await this.assistanceStateService.getUnassignedMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    query.stateId = state.toJSON().id;
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: send.toJSON().id,
    };
    const fullUser = RequestContextService.get<any>('user');
    if (fullUser.role.name == 'asesor') {
      query.userId = fullUser.id;
    }
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async getTicketsPending(query: MailFilter) {
    const state = await this.assistanceStateService.getPenddingMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    query.stateId = state.toJSON().id;
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: send.toJSON().id,
    };
    const fullUser = RequestContextService.get<any>('user');
    if (fullUser.role.name == 'asesor') {
      query.userId = fullUser.id;
    }
    query.type = MailType.INTERN_REPLY;
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async getTicketsNoWish(query: MailFilter) {
    const state = await this.assistanceStateService.getSpamMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    query.stateId = state.toJSON().id;
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: send.toJSON().id,
    };
    const fullUser = RequestContextService.get<any>('user');
    if (fullUser.role.name == 'asesor') {
      query.userId = fullUser.id;
    }
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async getEmailFile(
    messageId: string,
    attachmentId: string,
    mimeType: string,
    filename: string,
  ) {
    const attachBody: AttachementBody = {
      messageId: messageId,
      attachmentId: attachmentId,
      mimeType: mimeType,
      filename: filename,
    };
    try {
      const file = await this.emailChannelService.getAtachmentv2(attachBody);
      return file;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al descargar archivo ${attachmentId}:`,
        error.message,
      );
    }
  }
  async GetEmailAttentionDetail(mailAttentionId: number) {
    const result = await this.emailThreadRepository.findAll({
      where: { mailAttentionId },
      attributes: [
        'id',
        'subject',
        'from',
        'name',
        'to',
        'date',
        'content',
        'type',
        'mailStateId',
        'mailAttentionId',
        'messageHeaderGmailId',
        'referencesMail',
        'isRead',
        'createdAt',
      ],
      include: [
        {
          model: EmailAttachment,
          attributes: [
            'id',
            'attachmentGmailId',
            'cid',
            'filename',
            'mimeType',
            'publicUrl',
          ],
          required: false,
        },
        {
          model: EmailAttention,
          attributes: ['id', 'ticketCode', 'emailCitizen', 'assistanceStateId'],
          include: [
            {
              model: User,
              as: 'advisor',
            },
          ],
          required: true,
        },
      ],
      order: [['id', 'ASC']],
    });

    const GetTypeEmail = (type: MailType) => {
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

    for (const r of result) {
      if (!r.toJSON().isRead) {
        await r.update({ isRead: true });
      }
    }

    return this.buildThreadTree(
      result
        .map((r) => r.toJSON())
        .map((r: EmailThread) => ({
          id: r.id,
          from: r.from,
          to: r.to,
          date: r.date,
          subject: r.subject,
          content: r.content,
          ticketCode: r.emailAttention.ticketCode,
          name: r.name,
          state: r.emailAttention.assistanceState,
          attachments: r.attachments,
          advisor: r.emailAttention.advisor,
          inReplyTo: r.referencesMail,
          isRead: r.isRead,
          mailAttentionId: r.mailAttentionId,
          createdAt: r.createdAt,
          messageHeaderGmailId: r.messageHeaderGmailId,
          type: GetTypeEmail(r.type),
        })),
    );
  }

  private buildThreadTree(messages: any[]) {
    const map = new Map(messages.map((m) => [m.messageHeaderGmailId, m]));

    // Asignar el correo referenciado a cada mensaje
    const result = messages.map((msg) => {
      const current = msg;
      if (current.inReplyTo && map.has(current.inReplyTo)) {
        current.repliedTo = map.get(current.inReplyTo); // 🔗 correo referenciado
      }
      return current;
    });

    return result;
  }

  async balanceAdvisors() {
    try {
      const emailUsers = await this.inboxUserRepository.findAll({
        where: { channelStateId: emailAvailableStateId },
        include: [
          {
            model: User,
            as: 'user',
            where: { roleId: UserRole.Ase },
            include: [
              {
                model: EmailAttention,
                where: {
                  assistanceStateId: {
                    [Op.in]: [MailStates.PENDDING, MailStates.ATTENTION],
                  },
                },
                required: false,
              },
            ],
          },
          { model: Inbox, required: true },
        ],
        attributes: ['userId'],
      });

      const arrayUsers = emailUsers
        .map((a) => a.toJSON())
        .map((a: InboxUser) => ({
          userId: a.userId,
          assigns: a.user.emailAttentions.length,
        }));

      if (arrayUsers.length == 0) {
        throw new NotFoundException(
          'Por el momento no se encontraron asesores disponibles',
        );
      }

      const opensData = await this.emailAttentionRepository.findAll({
        where: {
          assistanceStateId: {
            [Op.in]: [MailStates.OPEN, MailStates.UNASSIGNED],
          },
        },
        order: [['id', 'DESC']],
      });
      const opens = opensData.map((a) => a.toJSON());

      const caseCounts = new Map<number, number>();

      arrayUsers.forEach((u) => {
        caseCounts.set(u.userId, u.assigns);
      });

      const allCases = [...opens];
      for (const openCase of allCases) {
        let leastLoaded = Array.from(caseCounts.entries()).sort(
          (a, b) => a[1] - b[1],
        )[0];
        if (!leastLoaded) continue;
        await this.emailAttentionRepository.update(openCase.id, {
          advisorUserId: leastLoaded[0],
        });
        caseCounts.set(leastLoaded[0], leastLoaded[1] + 1);
      }

      const userLoads = Array.from(caseCounts.entries()).map(
        ([userId, caseCount]) => ({
          userId,
          caseCount,
          cases: opens
            .filter((c) => c.advisorUserId === userId)
            .map((c) => c.id),
        }),
      );
      return userLoads;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(error?.message);
    }
  }

  async SendEmail(
    body: CenterEmail,
    files: { attachments?: Express.Multer.File[] },
    userId: number,
  ) {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          required: true,
          where: { channelId: ChannelEnum.EMAIL },
        },
      ],
    });
    if (!credential)
      throw new NotFoundException('No se encontro la credencial');
    const mail: BuildCenterEmail = {
      from: credential.toJSON().email,
      to: [body.to],
      subject: body.subject,
      html: body.content,
      refreshToken: credential.toJSON().refreshToken,
      clientId: credential.toJSON().clientID,
      email: credential.toJSON().email,
      userId,
    };
    if (files.attachments) {
      const attachments: FileEmail[] = [];
      for (const file of files.attachments) {
        const newAttachmnent: FileEmail = {
          filename: `${file.originalname}`,
          content: file.buffer,
          mimeType: file.mimetype,
        };
        attachments.push(newAttachmnent);
      }
      mail.attachments = attachments;
    }

    const contact = await this.citizenService.getBasicInfoFromEmailCitizen(
      body.to,
    );

    if (contact) {
      mail.name = contact.toJSON()?.citizen?.name;
    }

    const email = await this.emailChannelService.sendEmail(mail);
    return true;
    // const sendState = await this.emailStateRepository.getSend();
    // if (!sendState)
    //   throw new InternalServerErrorException('Error interno del servidor');
    // await this.emailWorkerService.createMail(
    //   email,
    //   MailType.CITIZEN,
    //   body.mailAttentionId,
    //   sendState.toJSON().id,
    // );
  }

  async changeEmailState(userId, channelStateId) {
    try {
      const ibox = await this.inboxRepository.findOne({
        where: { channelId: ChannelEnum.EMAIL },
      });
      if (!ibox)
        throw new NotFoundException('No se encontro la bandeja de entrada');
      const inboxId = ibox.toJSON().id;
      const inboxUser = await this.inboxUserRepository.findOne({
        where: {
          userId,
          inboxId,
        },
      });

      await inboxUser?.update({
        channelStateId,
      });

      return inboxUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeChatState(userId, channelStateId) {
    try {
      const ibox = await this.inboxRepository.findOne({
        where: { channelId: ChannelEnum.CHATSAT },
      });
      if (!ibox)
        throw new NotFoundException('No se encontro la bandeja de entrada');
      const inboxId = ibox.toJSON().id;
      const inboxUser = await this.inboxUserRepository.findOne({
        where: {
          userId,
          inboxId,
        },
      });

      await inboxUser?.update({
        channelStateId,
      });

      return inboxUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeWspState(userId, channelStateId) {
    try {
      const ibox = await this.inboxRepository.findOne({
        where: { channelId: ChannelEnum.WHATSAPP },
      });
      if (!ibox)
        throw new NotFoundException('No se encontro la bandeja de entrada');
      const inboxId = ibox.toJSON().id;
      const inboxUser = await this.inboxUserRepository.findOne({
        where: {
          userId,
          inboxId,
        },
      });

      await inboxUser?.update({
        channelStateId,
      });

      return inboxUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getEmailCitizen(email: string): Promise<any[]> {
    const sql = `SELECT DISTINCT e.email, e.name FROM (
      SELECT distinct et.from AS email, UPPER(et.name) AS name 
      FROM email_threads et WHERE et.from LIKE :searchEmail
      UNION ALL 
      SELECT distinct et.to AS email, UPPER(et.to_name) AS name 
      FROM email_threads et WHERE et.to LIKE :searchEmail
      UNION ALL
      SELECT cc.value AS email, c.name 
      FROM citizens AS c 
      INNER JOIN citizen_contacts cc ON cc.tip_doc = c.tip_doc AND cc.doc_ide = c.doc_ide
      WHERE cc.contact_type = 'EMAIL' AND LOWER(cc.value) LIKE :searchEmail
      ) AS e 
      WHERE e.email NOT IN ( SELECT email FROM email_credentials )
      ORDER BY e.email ASC
      LIMIT 10;
      `;

    try {
      const searchEmail = `${email}%`;

      const results = await this.sequelize.query(sql, {
        replacements: { searchEmail },
        type: 'SELECT',
      });

      return results;
    } catch (error) {
      console.error('Error al obtener el progreso:', error);
      throw new InternalServerErrorException('Error al obtener el progreso');
    }
  }
}
