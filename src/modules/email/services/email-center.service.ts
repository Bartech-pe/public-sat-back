import { Op } from 'sequelize';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { EmailAttentionRepository } from '../repositories/email-attention.repository';
import { AssistanceStateService } from '@modules/assistance-state/assistance-state.service';
import { ReplyCenterMail } from '../dto/reply-center-mail.dto';
import { EmailAttention } from '../entities/email-attention.entity';
import { MailFilter } from '../dto/mail-filter.dto';
import { EmailStateRepository } from '../repositories/email-state.repository';
import { EmailTicketList, GetTypeEmail } from '../email-ticket-list';
import { RequestContextService } from '@common/context/request-context.service';
import { EmailState } from '../entities/email-state.entity';
import { EmailChannelService } from './email-channel.service';
import { ReplyEmail } from '../dto/email-channel/reply-email.dto';
import { ForwardTo } from '../dto/email-channel/forward-to.dto';
import { ForwardCenterMail } from '../dto/forward-center-mail.dto';
import { InboxUserRepository } from '@modules/inbox/repositories/inbox-user.repository';
import { ChannelStateRepository } from '@modules/channel-state/repositories/channel-state.repository';
import { CenterEmail } from '../dto/center-email.dto';
import {
  AttachementBody,
  BuildCenterEmail,
  FileEmail,
} from '../dto/build-email.dto';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { EmailCredentialRepository } from '../repositories/email-credential.repository';
import { EmailWorkerService } from './email-worker.service';
import { MailType } from '../enum/mail-type.enum';
import { EmailAttachmentRepository } from '../repositories/email-attachment.repository';
import { groupBy } from '@common/helpers/group.helper';
import { Channel } from '@modules/channel/entities/channel.entity';
import { EmailThreadRepository } from '../repositories/email-thread.repository';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { User } from '@modules/user/entities/user.entity';
import { EmailThread } from '../entities/email-thread.entity';
import { roleIdAsesor } from '@common/constants/role.constant';
import { AssistanceState } from '@modules/assistance-state/entities/assistance-state.entity';
import { ChannelEnum } from '@common/enums/channel.enum';
import { EmailGateway } from '../email.gateway';

@Injectable()
export class EmailCenterService implements OnModuleInit {
  constructor(
    private readonly emailAttentionRepository: EmailAttentionRepository,
    private readonly assistanceStateService: AssistanceStateService,
    private readonly emailThreadRepository: EmailThreadRepository,
    private readonly emailStateRepository: EmailStateRepository,
    private readonly emailChannelService: EmailChannelService,
    private readonly inboxUserRepository: InboxUserRepository,
    private readonly channelStateRepository: ChannelStateRepository,
    private readonly emailCredentialRepository: EmailCredentialRepository,
    private readonly emailWorkerService: EmailWorkerService,
    private readonly emailAttachmentRepository: EmailAttachmentRepository,
    private readonly inboxRepository: InboxRepository,
    @Inject(forwardRef(() => EmailGateway))
    private readonly emailGateway: EmailGateway,
  ) {}
  async onModuleInit() {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          include: [
            {
              model: Channel,
              where: { id: 4 },
            },
          ],
        },
      ],
    });
    if (!credential) {
      console.log('Sin credencial');
      return;
    }
    const refreshToken = credential.toJSON().refreshToken;
    if (
      credential.toJSON().refreshToken &&
      credential.toJSON().clientTopic &&
      credential.toJSON().clientSecret &&
      credential.toJSON().clientID &&
      credential.toJSON().clientProject
    ) {
      try {
        const oAuth = await this.emailChannelService.setOAuth(
          credential.toJSON().clientID,
          credential.toJSON().clientSecret,
        );
        const watch = await this.emailChannelService.setWatch(
          refreshToken,
          credential.toJSON().clientTopic,
          credential.toJSON().clientProject,
        );
      } catch (error) {
        console.error('Error inicializando las credenciales:', error.message);
      }
    }
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

  async AttenttionTicket(mailAttentionId: number) {
    const exist = await this.emailAttentionRepository.findById(mailAttentionId);
    if (!exist) {
      throw new NotFoundException('No se encontro el ticket');
    }
    const state = await this.assistanceStateService.getAttentionMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    const updated = await this.emailAttentionRepository.update(
      mailAttentionId,
      {
        assistanceStateId: state.toJSON().id,
      },
    );
    this.emailGateway.notifyEmailRequest();
    return { status: 'Success', message: 'Ticket en Atención' };
  }
  async NoWisTicket(mailAttentionId: number) {
    const exist = await this.emailAttentionRepository.findById(mailAttentionId);
    if (!exist) {
      throw new NotFoundException('No se encontro el ticket');
    }
    const state = await this.assistanceStateService.getSpamMailState();
    if (!state) throw new NotFoundException('No se encontro el estado');
    const updated = await this.emailAttentionRepository.update(
      mailAttentionId,
      {
        assistanceStateId: state.toJSON().id,
      },
    );
    return { status: 'Success', message: 'Ticket en Atención' };
  }
  async RespondMail(body: ReplyCenterMail) {
    const { mailAttentionId } = body;
    const mailThreads = await this.emailThreadRepository.findAll({
      where: { mailAttentionId: mailAttentionId },
      order: [['createdAt', 'ASC']],
      include: [{ model: EmailAttention, attributes: ['mailThreadId'] }],
    });
    const mailThread = mailThreads[0];
    if (!mailThread)
      throw new NotFoundException('No se encontro el hilo del correo');
    const mailthreadJson: EmailThread = mailThread.toJSON();
    const messageId = mailthreadJson.messageGmailId;
    const request: ReplyEmail = {
      messageId: messageId,
      content: body.content,
      threadId: mailthreadJson.emailAttention.mailThreadId,
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
    const mailthreadJson = mailThread.toJSON();
    const messageId = mailthreadJson.messageGmailId;
    const request: ForwardTo = {
      messageId: messageId,
      forwardTo: body.from,
      message: body.message,
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
    if (fullUser.roleId == roleIdAsesor) {
      query.advisorEmailId = fullUser.id;
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
    if (fullUser.roleId == roleIdAsesor) {
      query.advisorEmailId = fullUser.id;
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
      query.advisorEmailId = fullUser.id;
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
      query.advisorEmailId = fullUser.id;
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
      query.advisorEmailId = fullUser.id;
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
      query.advisorEmailId = fullUser.id;
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
    const state = await this.assistanceStateService.getOpenMailState();
    const id = state?.toJSON().id;
    const tickets = await this.emailThreadRepository.findAll({
      where: {
        mailAttentionId: mailAttentionId,
      },
      attributes: [
        'id',
        'subject',
        'content',
        'mailAttentionId',
        'from',
        'to',
        'createdAt',
        'inReplyTo',
        'type',
      ],
      include: [
        {
          model: EmailAttention,
          attributes: ['ticketCode', 'emailCitizen', 'assistanceStateId'],
          include: [AssistanceState],
        },
        {
          model: EmailState,
          attributes: ['name'],
        },
      ],
    });
    const elements = tickets.map((a) => a.toJSON());
    if (elements.length == 0) return [];
    const files = await this.emailAttachmentRepository.findAll({
      attributes: [
        'id',
        'filename',
        'attachmentGmailId',
        'mailThreadId',
        'mimeType',
      ],
      where: {
        mailThreadId: { [Op.in]: elements.map((e) => e.id) },
      },
      include: [{ model: EmailThread, attributes: ['messageGmailId'] }],
    });
    const filesJson = files.map((a) => a.toJSON());
    const filesgroup = groupBy(filesJson, (file) => file.mailThreadId ?? '');

    const ticketsJson = elements.map((json) => {
      return {
        id: json.id,
        subject: json.subject,
        content: json.content,
        mailAttentionId: json.mailAttentionId,
        ticketCode: json.emailAttention.ticketCode,
        from: json.emailAttention.emailCitizen,
        state: json.emailAttention.assistanceStateId,
        advisor: json.emailAttention?.advisor?.name,
        createdAt: json.createdAt,
        isAnswer: json.inReplyTo ? true : false,
        type: GetTypeEmail(json.type),
        files: filesgroup[json.id],
      };
    });
    return ticketsJson;
  }
  async balanceAdvisors() {
    try {
      const state = await this.assistanceStateService.getOpenMailState();
      if (!state) throw new NotFoundException('No se encontro el estado');
      const noAttention =
        await this.assistanceStateService.getUnassignedMailState();
      if (!noAttention) throw new NotFoundException('No se encontro el estado');
      const attentionId = state.toJSON().id;
      const noAttentionId = noAttention.toJSON().id;
      const stateAvalible =
        await this.channelStateRepository.findAvalibleEmail();
      if (!stateAvalible)
        throw new InternalServerErrorException('Estado no disponible');
      const stateAvalibleJson = stateAvalible.toJSON();
      const ibox = await this.inboxRepository.findOne({
        where: { channelId: ChannelEnum.EMAIL },
      });
      if (!ibox) throw new NotFoundException('No se encontro la credencial');
      const inboxId = ibox.toJSON().id;
      const emailUsers = await this.inboxUserRepository.findAll({
        where: { channelStateId: stateAvalibleJson.id, inboxId: inboxId },
        include: [
          {
            model: User,
            as: 'user',
            where: { roleId: roleIdAsesor },
          },
        ],
        attributes: ['userId'],
      });
      const emailUserJson = emailUsers.map((a) => a.toJSON());
      if (emailUserJson.length == 0) {
        throw new NotFoundException(
          'Por el momento no se encontraron asesores disponibles',
        );
      }
      const availableUserIds = emailUserJson.map((user) => user.userId);
      const opensData = await this.emailAttentionRepository.findAll({
        where: { assistanceStateId: { [Op.in]: [attentionId, noAttentionId] } },
      });
      const opens = opensData.map((a) => a.toJSON());
      const caseCounts = new Map<number, number>();
      availableUserIds.forEach((userId) => {
        caseCounts.set(userId, 0);
      });
      const unassignedCases: any[] = [];
      opens.forEach((openCase) => {
        if (
          openCase.advisorUserId &&
          availableUserIds.includes(openCase.advisorUserId)
        ) {
          caseCounts.set(
            openCase.advisorUserId,
            (caseCounts.get(openCase.advisorUserId) || 0) + 1,
          );
        } else {
          unassignedCases.push(openCase);
        }
      });
      const allCases = [...opens];
      for (const openCase of allCases) {
        let leastLoaded = Array.from(caseCounts.entries()).sort(
          (a, b) => a[1] - b[1],
        )[0];
        if (!leastLoaded) continue;
        if (
          !openCase.advisorUserId ||
          !availableUserIds.includes(openCase.advisorUserId)
        ) {
          openCase.advisorUserId = leastLoaded[0];
          await this.emailAttentionRepository.update(openCase.id, {
            advisorUserId: leastLoaded[0],
            advisorInboxId: inboxId,
            assistanceStateId: attentionId,
          });
          caseCounts.set(leastLoaded[0], leastLoaded[1] + 1);
        } else {
          let currentLoad = caseCounts.get(openCase.advisorUserId)!;
          if (currentLoad > leastLoaded[1] + 1) {
            caseCounts.set(openCase.advisorUserId, currentLoad - 1);
            openCase.advisorUserId = leastLoaded[0];
            await this.emailAttentionRepository.update(openCase.id, {
              advisorUserId: leastLoaded[0],
            });
            caseCounts.set(leastLoaded[0], leastLoaded[1] + 1);
          }
        }
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
  ) {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
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
      text: body.content,
      refreshToken: credential.toJSON().refreshToken,
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
    const email = await this.emailChannelService.sendEmail(mail);
    const sendState = await this.emailStateRepository.getSend();
    if (!sendState)
      throw new InternalServerErrorException('Error interno del servidor');
    await this.emailWorkerService.createMail(
      email,
      MailType.CITIZEN,
      body.mailAttentionId,
      sendState.toJSON().id,
    );
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
}
