import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EmailCredentialRepository } from '../repositories/email-credential.repository';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { EmailAttachmentRepository } from '../repositories/email-attachment.repository';
import { EmailAttentionRepository } from '../repositories/email-attention.repository';
import { EmailSent } from '../dto/center-email.dto';
import { MailType } from '../enum/mail-type.enum';
import { EmailStateRepository } from '../repositories/email-state.repository';
import { AssistanceStateService } from '@modules/custom-states/assistance-state/assistance-state.service';
import { User } from '@modules/user/entities/user.entity';

import { InboxUserRepository } from '@modules/inbox/repositories/inbox-user.repository';
import { EmailAttachment } from '../entities/email-attachment.entity';
import { EmailThreadRepository } from '../repositories/email-thread.repository';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { AssistanceState } from '@modules/custom-states/assistance-state/entities/assistance-state.entity';
import { ChannelEnum } from '@common/enums/channel.enum';
import { EmailGateway } from '../email.gateway';
import { EmailAttention } from '../entities/email-attention.entity';
import { FileHelper } from '@common/helpers/file.helper';
import { UserRole } from '@common/constants/role.constant';
import { EmailThread } from '../entities/email-thread.entity';
import { emailAvailableStateId } from '@common/constants/channel.constant';
import { Op } from 'sequelize';
import { MailStates } from '@common/enums/assistance-state.enum';
import { InboxUser } from '@modules/inbox/entities/inbox-user.entity';

@Injectable()
export class EmailWorkerService {
  constructor(
    private readonly emailCredentialRepository: EmailCredentialRepository,
    private readonly emailAttentionRepository: EmailAttentionRepository,
    private readonly emailThreadRepository: EmailThreadRepository,
    private readonly emailStateRepository: EmailStateRepository,
    private readonly assistanceStateService: AssistanceStateService,
    private readonly inboxUserRepository: InboxUserRepository,
    private readonly emailAttachmentRepository: EmailAttachmentRepository,
    private readonly inboxRepository: InboxRepository,
    @Inject(forwardRef(() => EmailGateway))
    private readonly emailGateway: EmailGateway,
  ) {}
  private generateCode() {
    return Math.random()
      .toString()
      .slice(2, 2 + 6);
  }

  private parseEmail(input: string) {
    const regex = /^(.*?)\s*<(.+?)>$/;
    const match = input.match(regex);

    if (match) {
      const name = match[1].trim();
      const email = match[2].trim();
      return { name, email };
    }

    // Si solo viene el correo sin nombre
    return { name: undefined, email: input.trim() };
  }

  async getSatCredential(): Promise<{ email: string; clientId: string }> {
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
    return {
      email: credential.toJSON().email,
      clientId: credential.toJSON().clientID,
    };
  }

  async caseAdvisor(event: EmailSent, emailGeneral: string) {
    const attentionEntity = await this.emailAttentionRepository.findOne({
      where: { mailThreadId: event.threadId },
    });
    if (!attentionEntity) return { success: false };
    const match = event.from.match(/<(.*?)>/);
    const emailOnly = match ? match[1] : event.from;
    if (emailGeneral === emailOnly) {
      const sendState = await this.emailStateRepository.getSend();
      if (!sendState)
        throw new InternalServerErrorException('Error interno del servidor');
      return {
        success: true,
        type: MailType.ADVISOR,
        attentionId: attentionEntity.toJSON().id,
        state: sendState.toJSON().id,
      };
    }
    return {
      success: false,
    };
  }

  async caseForwardTo(event: EmailSent) {
    if (!event.forward) return { success: false };
    const threadEntity = await this.emailThreadRepository.findOne({
      where: { messageGmailId: event.forward },
    });
    if (!threadEntity) return { success: false };
    const sendState = await this.emailStateRepository.getForward();
    if (!sendState)
      throw new InternalServerErrorException('Error interno del servidor');
    return {
      success: true,
      type: MailType.INTERN_FORWARD,
      attentionId: threadEntity.toJSON().mailAttentionId,
      state: sendState.toJSON().id,
    };
  }

  async caseInternAnswer(event: EmailSent) {
    const messageId = event.inReplyTo
      ? await this.emailThreadRepository.findOne({
          where: { messageHeaderGmailId: event.inReplyTo },
        })
      : null;
    if (
      event.inReplyTo &&
      messageId &&
      messageId.toJSON().type == MailType.INTERN_FORWARD
    ) {
      const sendState = await this.emailStateRepository.getReply();
      if (!sendState)
        throw new InternalServerErrorException('Error interno del servidor');
      return {
        success: true,
        type: MailType.INTERN_REPLY,
        attentionId: messageId.toJSON().mailAttentionId,
        state: sendState.toJSON().id,
      };
    }
    return { success: false };
  }

  async caseAnswerInThread(event: EmailSent) {
    if (!event.inReplyTo) {
      return { success: false };
    }
    const messageId = await this.emailThreadRepository.findOne({
      where: { messageHeaderGmailId: event.inReplyTo },
      include: [
        {
          model: EmailAttention,
          include: [AssistanceState],
        },
      ],
    });
    if (messageId) {
      const sendState = await this.emailStateRepository.getReply();
      if (!sendState)
        throw new InternalServerErrorException('Error interno del servidor');
      return {
        success: true,
        type: MailType.CITIZEN,
        attentionId: messageId.toJSON().mailAttentionId,
        state: sendState.toJSON().id,
        assistanceState: messageId.toJSON().emailAttention.assistanceState,
      };
    }
    return { success: false };
  }

  async createMail(
    event: EmailSent,
    type: MailType,
    mailAttentionId: number,
    stateId: number,
  ) {
    try {
      const thread = await this.emailThreadRepository.create({
        subject: event.subject,
        content: event.content,
        to: this.parseEmail(event.to)?.email,
        toName: this.parseEmail(event.to)?.name,
        from: this.parseEmail(event.from)?.email,
        name: this.parseEmail(event.from)?.name,
        date: event.date,
        mailAttentionId: mailAttentionId,
        mailStateId: stateId,
        isFavorite: false,
        isRead: false,
        messageGmailId: event.messageId,
        messageHeaderGmailId: event.referencesMail,
        referencesMail: event.references,
        inReplyTo: event.inReplyTo,
        type: type,
      });

      this.emailGateway.notifyEmailRequest();

      if (event.attachments) {
        const existingAttachments =
          await this.emailAttachmentRepository.findAll({
            attributes: ['cid'],
            include: [
              {
                model: EmailThread,
                attributes: [],
                where: { mailAttentionId }, // el id de tu atención
                required: true,
              },
            ],
            raw: true,
          });

        const existingCidSet = new Set(existingAttachments.map((a) => a.cid));

        const cidsToInsert = event.attachments.filter(
          (a) => !existingCidSet.has(a.cid),
        );

        if (cidsToInsert.length) {
          const createFiles = await Promise.all(
            cidsToInsert.map(async (a) => {
              const { publicUrl } = await FileHelper.saveAttachment(a);
              const attach: Partial<EmailAttachment> = {
                attachmentGmailId: a.attachmentId,
                cid: a.cid,
                filename: a.filename,
                mimeType: a.mimeType,
                mailThreadId: thread.toJSON().id,
                publicUrl: publicUrl,
              };
              return attach;
            }),
          );
          await this.emailAttachmentRepository.bulkCreate(createFiles);
        }
      }
      return thread;
    } catch (error) {
      console.log(error);
    }
  }

  // async getAdvisorsAvaliable() {
  //   try {
  //     const stateAvalible =
  //       await this.stateChannelRepository.findAvalibleEmail();
  //     if (!stateAvalible)
  //       throw new InternalServerErrorException(
  //         'No se encontró el estado DISPONIBLE',
  //       );
  //     const stateAvalibleJson = stateAvalible.toJSON();
  //     const skillId = stateAvalibleJson.id;
  //     const ibox = await this.inboxRepository.findOne({
  //       where: { channelId: ChannelEnum.EMAIL },
  //     });
  //     if (!ibox) throw new NotFoundException('No se encontro la credencial');
  //     const inboxId = ibox.toJSON().id;
  //     const emailUsers = await this.inboxUserRepository.findAll({
  //       where: { channelStateId: stateAvalibleJson.id, inboxId: inboxId },
  //       include: [{ model: User, as: 'user', where: { roleId: UserRole.Ase } }],
  //       attributes: ['userId'],
  //     });
  //     const emailUserJson = emailUsers.map((a) => a.toJSON());
  //     return { skillId, emailUserJson };
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return { skillId: 0, emailUserJson: [] };
  // }

  async getAdvisorToAssign(): Promise<
    { userId: number; assigns: number } | undefined
  > {
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
                    [Op.notIn]: [MailStates.SPAM, MailStates.CLOSED],
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

      arrayUsers.sort((a, b) => a.assigns - b.assigns);
      return arrayUsers[0];
    } catch (error) {
      console.error(error);
    }
  }

  async createAttention(event: EmailSent, userId?: number) {
    try {
      let attention: AssistanceState | null = null;
      let inboxId: number | null = null;
      if (userId) {
        const mailUserDto = await this.inboxUserRepository.findOne({
          where: { userId: userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email'],
            },
          ],
        });
        const mailUserDtoJson = mailUserDto?.toJSON();
        inboxId = mailUserDtoJson?.inboxId;
        attention = await this.assistanceStateService.getOpenMailState();
      } else {
        attention = await this.assistanceStateService.getUnassignedMailState();
      }
      const code = this.generateCode();
      if (!attention)
        throw new InternalServerErrorException(
          'Error interno del servidor Problemas con la atención asignada',
        );
      const sendState = await this.emailStateRepository.getSend();
      if (!sendState)
        throw new InternalServerErrorException(
          'Problemas con el estado de envio',
        );
      const created = await this.emailAttentionRepository.create({
        emailCitizen:
          !!event.userId || event.userId == 0
            ? this.parseEmail(event.to)?.email
            : this.parseEmail(event.from)?.email,
        advisorUserId: !!userId ? userId : undefined,
        advisorInboxId: !!inboxId ? inboxId : undefined,
        ticketCode: code,
        mailThreadId: event.threadId,
        assistanceStateId:
          !!event.userId || event.userId == 0
            ? MailStates.CLOSED
            : attention.toJSON().id,
      });
      const thread = await this.emailThreadRepository.create({
        subject: event.subject,
        content: event.content,
        to: this.parseEmail(event.to)?.email,
        toName: this.parseEmail(event.to)?.name,
        from: this.parseEmail(event.from)?.email,
        name: this.parseEmail(event.from)?.name,
        date: event.date,
        mailAttentionId: created.toJSON().id,
        mailStateId: sendState.toJSON().id,
        isFavorite: false,
        isRead: !!event.userId,
        messageGmailId: event.messageId,
        messageHeaderGmailId: event.referencesMail,
        referencesMail: event.references,
        inReplyTo: event.inReplyTo,
        type:
          !!event.userId || event.userId == 0
            ? MailType.ADVISOR
            : MailType.CITIZEN,
      });
      if (event.attachments) {
        const createFiles = await Promise.all(
          event.attachments.map(async (a) => {
            const { publicUrl } = await FileHelper.saveAttachment(a);
            const attach: Partial<EmailAttachment> = {
              filename: a.filename,
              mimeType: a.mimeType,
              cid: a.cid,
              mailThreadId: thread.toJSON().id,
              publicUrl: publicUrl,
            };
            return attach;
          }),
        );
        await this.emailAttachmentRepository.bulkCreate(createFiles);
      }
      this.emailGateway.notifyEmailRequest();
    } catch (error) {
      console.error(error);
    }
  }

  async getGmailHeaderMessageId(messageId: string) {
    return await this.emailThreadRepository.findOne({
      where: { messageHeaderGmailId: messageId },
    });
  }

  isReply(subject: string): boolean {
    return /^(Re|R):/i.test(subject?.trim());
  }

  async inboxExist(): Promise<boolean> {
    return !!(await this.inboxRepository.findOne({
      where: { channelId: ChannelEnum.EMAIL },
    }));
  }
}
