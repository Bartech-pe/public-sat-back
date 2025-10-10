import { forwardRef, Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@modules/user/user.module';
import { RoleModule } from '@modules/role/role.module';
import { ScreenModule } from '@modules/screen/screen.module';
import { jwtConfig } from 'config/env';
import { JwtCitizenStrategy } from './strategies/jwt-citizen.strategy';
import { MultiChannelChatModule } from '@modules/multi-channel-chat/multi-channel-chat.module';
import { CentralTelefonicaModule } from '@modules/vicidial/central-telefonica/central-telefonica.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        secret: jwtConfig.secret,
        signOptions: { expiresIn: jwtConfig.expires },
      }),
    }),
    RoleModule,
    UserModule,
    ScreenModule,
    forwardRef(() => MultiChannelChatModule),
    CentralTelefonicaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtCitizenStrategy],
  exports: [AuthService, JwtModule, JwtCitizenStrategy],
})
export class AuthModule {}
