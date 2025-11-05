import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Tags } from '../entities/tag.entity';

@Injectable()
export class TagsRepository extends GenericCrudRepository<Tags> {
  constructor(
    @InjectModel(Tags)
    model: typeof Tags,
  ) {
      super(model);
  }
}