import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { WhereOptions } from 'sequelize';

@Injectable()
export class UserRepository extends GenericCrudRepository<User> {
  constructor(
    @InjectModel(User)
    model: typeof User,
  ) {
    super(model);
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.model.scope('withPassword').findOne({
      where: {
        email,
      } as unknown as WhereOptions<any>,
    });
    return user as User;
  }
}
