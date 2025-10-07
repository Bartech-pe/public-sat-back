import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Skill } from '../entities/skill.entity';

@Injectable()
export class SkillRepository extends GenericCrudRepository<Skill> {
  constructor(
    @InjectModel(Skill)
    model: typeof Skill,
  ) {
    super(model);
  }
}
