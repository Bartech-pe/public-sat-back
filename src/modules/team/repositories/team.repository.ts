import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Team } from '../entities/team.entity';

@Injectable()
export class TeamRepository extends GenericCrudRepository<Team> {
  constructor(
    @InjectModel(Team)
    model: typeof Team,
  ) {
    super(model);
  }
}
