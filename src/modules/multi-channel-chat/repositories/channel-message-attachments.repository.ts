import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelMessageAttachment } from '../entities/channel-message-attachments.entity';

@Injectable()
export class ChannelMessageAttachmentRepository extends GenericCrudRepository<ChannelMessageAttachment> {
  constructor(
    @InjectModel(ChannelMessageAttachment)
    model: typeof ChannelMessageAttachment,
  ) {
    super(model);
  }
}
