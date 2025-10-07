import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EmailSignature } from '../entities/email-signature.entity';

@Injectable()
export class EmailSignatureRepository extends GenericCrudRepository<EmailSignature> {
  constructor(
    @InjectModel(EmailSignature)
    model: typeof EmailSignature,
  ) {
    super(model);
  }
}
