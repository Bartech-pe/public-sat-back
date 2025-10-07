import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Inbox } from '../entities/inbox.entity';

@Injectable()
export class InboxRepository extends GenericCrudRepository<Inbox> {
  constructor(
    @InjectModel(Inbox)
    model: typeof Inbox,
  ) {
    super(model);
  }
}
