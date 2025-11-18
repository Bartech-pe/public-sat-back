import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { EmailAttention } from '../entities/email-attention.entity';
import { CountOptions } from 'sequelize';

@Injectable()
export class EmailAttentionRepository extends GenericCrudRepository<EmailAttention> {
  constructor(
    @InjectModel(EmailAttention)
    model: typeof EmailAttention,
  ) {
    super(model);
  }
}
