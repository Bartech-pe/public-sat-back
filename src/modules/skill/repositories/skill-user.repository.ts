import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { SkillUser } from '../entities/skill-user.entity';

@Injectable()
export class SkillUserRepository extends GenericCrudRepository<SkillUser> {
  constructor(
    @InjectModel(SkillUser)
    model: typeof SkillUser,
  ) {
    super(model);
  }
}
