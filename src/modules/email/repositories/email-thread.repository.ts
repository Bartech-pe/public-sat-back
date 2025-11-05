import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { EmailThread } from '../entities/email-thread.entity';

@Injectable()
export class EmailThreadRepository extends GenericCrudRepository<EmailThread> {
  constructor(
    @InjectModel(EmailThread)
    model: typeof EmailThread,
  ) {
    super(model);
  }
}
