import { Injectable } from '@nestjs/common';
import { EmailThread } from '../entities/email-thread.entity';
import { AttachementBody } from '../dto/build-email.dto';
import { EmailChannelService } from './email-channel.service';
import { EmailAttachmentRepository } from '../repositories/email-attachment.repository';

@Injectable()
export class EmailAttachmentService {
  constructor(
    private readonly emailChannelService: EmailChannelService,
    private readonly emailAttachmentRepository: EmailAttachmentRepository,
  ) {}

  async getFilesByMessageId(mailThreadId: string) {
    const files: any[] = [];
    const mailAttachments = await this.emailAttachmentRepository.findAll({
      where: { mailThreadId: mailThreadId },
      include: [
        {
          model: EmailThread,
          attributes: ['messageGmailId'],
        },
      ],
    });
    if (!mailAttachments) {
      return [];
    }
    const messageId = mailAttachments[0].toJSON().mailThread.messageGmailId;
    mailAttachments.forEach(async (element) => {
      const request: AttachementBody = {
        messageId: messageId,
        attachmentId: element.attachmentGmailId,
      };
      const file = await this.emailChannelService.getAtachment(request);
      files.push(file);
    });
    return files;
  }
}
