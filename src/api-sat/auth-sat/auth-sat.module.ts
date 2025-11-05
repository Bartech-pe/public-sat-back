import { Module } from '@nestjs/common';
import { AuthSatService } from './auth-sat.service';

@Module({
  providers: [AuthSatService],
  exports: [AuthSatService],
})
export class AuthSatModule {}
