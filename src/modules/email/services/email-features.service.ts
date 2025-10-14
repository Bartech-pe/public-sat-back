import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MailFilter } from '../dto/mail-filter.dto';
import { EmailTicketList } from '../email-ticket-list';
import { Op } from 'sequelize';
import { EmailThreadRepository } from '../repositories/email-thread.repository';
import { EmailStateRepository } from '../repositories/email-state.repository';
import { EmailCredentialRepository } from '../repositories/email-credential.repository';
import { EmailChannelService } from './email-channel.service';
import { EmailThread } from '../entities/email-thread.entity';
import { EmailState } from '../entities/email-state.entity';
import { GenericEmail } from '../dto/center-email.dto';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { BuildCenterEmail } from '../dto/build-email.dto';
import { CategoryChannelEnum } from '@common/enums/category-channel.enum';
import { ChannelEnum } from '@common/enums/channel.enum';

@Injectable()
export class EmailFeaturesService {
  constructor(
    private readonly emailThreadRepository: EmailThreadRepository,
    private readonly emailStateRepository: EmailStateRepository,
    private readonly emailCredentialRepository: EmailCredentialRepository,
    private readonly emailChannelService: EmailChannelService,
  ) {}
  async trashMail(mailthreadId: number) {
    const exist = await this.emailThreadRepository.findById(mailthreadId);
    if (!exist) throw new NotFoundException('Correo no existe');
    const trash = await this.emailStateRepository.getTrash();
    if (!trash)
      throw new InternalServerErrorException('Error interno del servidor');
    await this.emailThreadRepository.update(mailthreadId, {
      mailStateId: trash.toJSON().id,
    });
  }
  async mailTrashList(query: MailFilter) {
    const trash = await this.emailStateRepository.getTrash();
    if (!trash)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: trash.toJSON().id,
    };
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async mailDraftList(query: MailFilter) {
    const draft: EmailState | null = await this.emailStateRepository.getDraft();
    if (!draft)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: draft.toJSON().id as number,
    };
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async draftMail(mailthreadId: number) {
    const exist = await this.emailThreadRepository.findById(mailthreadId);
    if (!exist) throw new NotFoundException('Correo no existe');
    const draft = await this.emailStateRepository.getDraft();
    if (!draft)
      throw new InternalServerErrorException('Error interno del servidor');
    await this.emailThreadRepository.update(mailthreadId, {
      mailStateId: draft.toJSON().id,
    });
  }
  async SpamMail(mailthreadId: number) {
    const exist = await this.emailThreadRepository.findById(mailthreadId);
    if (!exist) throw new NotFoundException('Correo no existe');
    const spam = await this.emailStateRepository.getSpam();
    if (!spam)
      throw new InternalServerErrorException('Error interno del servidor');
    await this.emailThreadRepository.update(mailthreadId, {
      mailStateId: spam.toJSON().id,
    });
  }
  async mailSpamList(query: MailFilter) {
    const spam = await this.emailStateRepository.getSpam();
    if (!spam)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      mailStateId: spam.toJSON().id,
    };
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async changeSendMail(mailthreadId: number) {
    const exist = await this.emailThreadRepository.findById(mailthreadId);
    if (!exist) throw new NotFoundException('Correo no existe');
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    await this.emailThreadRepository.update(mailthreadId, {
      mailStateId: send.toJSON().id,
    });
  }

  async favoriteUpdate(mailthreadId: number) {
    const exist = await this.emailThreadRepository.findById(mailthreadId);
    if (!exist) throw new NotFoundException('Correo no existe');
    const favorite = exist.toJSON().isFavorite ? false : true;
    await this.emailThreadRepository.update(mailthreadId, {
      isFavorite: favorite,
    });
  }
  async favoriteList(query: MailFilter) {
    const send = await this.emailStateRepository.getSend();
    if (!send)
      throw new InternalServerErrorException('Error interno del servidor');
    const whereThread: any = {
      parentId: { [Op.is]: null },
      mailStateId: send.toJSON().id,
      isFavorite: true,
    };
    return await EmailTicketList(
      whereThread,
      query,
      this.emailThreadRepository,
    );
  }
  async buildGenericEmail(body: GenericEmail) {
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
    if (body.html) {
      mail.html = JSON.parse(body.html);
    }
    const email = await this.emailChannelService.sendEmail(mail);
    return email;
  }
}