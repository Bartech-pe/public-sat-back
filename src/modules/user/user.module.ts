import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { VicidialUser } from './entities/vicidial-user.entity';
import { VicidialUserRepository } from './repositories/vicidial-user.repository';
import { VicidialApiModule } from '@modules/vicidial/vicidial-api/vicidial-api.module';
import { UserGateway } from './user.gateway';
import { AuthModule } from '@modules/auth/auth.module';
import { VicidialUserHistory } from './entities/vicidial-user-history.model';
import { VicidialUserHistoryRepository } from './repositories/vicidial-user-history.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([User, VicidialUser, VicidialUserHistory]),
    VicidialApiModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, VicidialUserRepository, UserGateway, VicidialUserHistoryRepository],
  exports: [UserRepository, VicidialUserRepository, UserGateway, VicidialUserHistoryRepository],
})
export class UserModule {}
