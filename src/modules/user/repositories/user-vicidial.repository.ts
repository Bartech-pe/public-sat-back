import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { UserVicidial } from '../entities/user-vicidial.entity';

@Injectable()
export class UserVicidialRepository extends GenericCrudRepository<UserVicidial> {
  constructor(
    @InjectModel(UserVicidial)
    model: typeof UserVicidial,
  ) {
    super(model);
  }
}
