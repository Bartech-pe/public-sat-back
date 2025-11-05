import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessageRepository extends GenericCrudRepository<Message> {
  constructor(
    @InjectModel(Message)
    model: typeof Message,
  ) {
    super(model);
  }
}
