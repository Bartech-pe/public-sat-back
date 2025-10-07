import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { TeamUser } from '../entities/team-user.entity';

@Injectable()
export class TeamUserRepository extends GenericCrudRepository<TeamUser> {
  constructor(
    @InjectModel(TeamUser)
    model: typeof TeamUser,
  ) {
    super(model);
  }
}
