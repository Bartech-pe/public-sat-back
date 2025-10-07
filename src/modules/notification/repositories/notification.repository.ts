import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationRepository extends GenericCrudRepository<Notification> {
  constructor(
    @InjectModel(Notification)
    model: typeof Notification,
  ) {
    super(model);
  }
}
