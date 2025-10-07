import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InboxCredential } from '../entities/inbox-credential.entity';


@Injectable()
export class InboxCredentialRepository extends GenericCrudRepository<InboxCredential> {
  constructor(
	@InjectModel(InboxCredential)
	model: typeof InboxCredential,
  ) {
	super(model);
  }
}
