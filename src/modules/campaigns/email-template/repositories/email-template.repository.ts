import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { EmailTemplate } from '../entities/email-template.entity';

@Injectable()
export class EmailTemplateRepository extends GenericCrudRepository<EmailTemplate> {
  constructor(
    @InjectModel(EmailTemplate)
    model: typeof EmailTemplate,
  ) {
      super(model);
  }
}