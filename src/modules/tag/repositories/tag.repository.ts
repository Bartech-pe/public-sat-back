import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagRepository extends GenericCrudRepository<Tag> {
  constructor(
    @InjectModel(Tag)
    model: typeof Tag,
  ) {
      super(model);
  }
}