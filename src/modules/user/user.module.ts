import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { UserVicidial } from './entities/user-vicidial.entity';
import { VicidialApiModule } from '@modules/vicidial-api/vicidial-api.module';
import { UserVicidialRepository } from './repositories/user-vicidial.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserVicidial]),
    VicidialApiModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository,UserVicidialRepository],
  exports: [UserRepository,UserVicidialRepository],

})
export class UserModule {}
