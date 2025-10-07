import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { CategoryChannel } from '../entities/category-channel.entity';

/**
 * Repository for CategoryChannel entity.
 * Extends GenericCrudRepository to provide common CRUD operations,
 * while allowing for custom methods specific to CategoryChannel in the future.
 */
@Injectable()
export class CategoryChannelRepository extends GenericCrudRepository<CategoryChannel> {
  constructor(
    @InjectModel(CategoryChannel)
    model: typeof CategoryChannel,
  ) {
    super(model);
  }
}
