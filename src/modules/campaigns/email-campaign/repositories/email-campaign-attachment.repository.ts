import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { EmailCampaignAttachment } from '../entities/email-campaign-attachment.entity';

@Injectable()
export class EmailCampaignAttachmentRepository extends GenericCrudRepository<EmailCampaignAttachment> {
  constructor(
    @InjectModel(EmailCampaignAttachment)
    model: typeof EmailCampaignAttachment,
  ) {
    super(model);
  }
}
