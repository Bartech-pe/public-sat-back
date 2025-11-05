import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { VicidialCredential } from '../entities/vicidial-credentials.entity';


@Injectable()
export class VicidialCredentialRepository extends GenericCrudRepository<VicidialCredential> {
  constructor(
	@InjectModel(VicidialCredential)
	model: typeof VicidialCredential,
  ) {
	super(model);
  }
}
