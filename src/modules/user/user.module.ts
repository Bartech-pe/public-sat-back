import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { VicidialUser } from './entities/vicidial-user.entity';
import { VicidialUserRepository } from './repositories/vicidial-user.repository';
import { VicidialApiModule } from '@modules/vicidial/vicidial-api/vicidial-api.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, VicidialUser]),
    VicidialApiModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, VicidialUserRepository],
  exports: [UserRepository, VicidialUserRepository],
})
export class UserModule {}
