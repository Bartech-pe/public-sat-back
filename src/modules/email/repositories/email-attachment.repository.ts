import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EmailAttachment } from '../entities/email-attachment.entity';

@Injectable()
export class EmailAttachmentRepository extends GenericCrudRepository<EmailAttachment> {
  constructor(
    @InjectModel(EmailAttachment)
    model: typeof EmailAttachment,
  ) {
    super(model);
  }
}
