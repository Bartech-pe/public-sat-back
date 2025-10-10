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
import { CallHistory } from './entities/call_history.entity';
import { CallHistoryRepository } from './repositories/call-history.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([User, VicidialUser, CallHistory]),
    VicidialApiModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    VicidialUserRepository,
    CallHistoryRepository,
    UserGateway,
  ],
  exports: [
    UserRepository,
    VicidialUserRepository,
    CallHistoryRepository,
    UserGateway,
  ],
})
export class UserModule {}
