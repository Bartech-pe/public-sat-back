import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { TemplateEmail } from '../entities/template-email.entity';

@Injectable()
export class TemplateEmailRepository extends GenericCrudRepository<TemplateEmail> {
  constructor(
    @InjectModel(TemplateEmail)
    model: typeof TemplateEmail,
  ) {
      super(model);
  }
}