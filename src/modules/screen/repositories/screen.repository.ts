import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { Screen } from '../entities/screen.entity';

@Injectable()
export class ScreenRepository extends GenericCrudRepository<Screen> {
  constructor(
    @InjectModel(Screen)
    model: typeof Screen,
  ) {
    super(model);
  }
}
