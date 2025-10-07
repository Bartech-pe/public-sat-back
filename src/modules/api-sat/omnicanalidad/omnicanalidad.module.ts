import { Module } from '@nestjs/common';
import { OmnicanalidadController } from './omnicanalidad.controller';
import { AuthSatModule } from '../auth-sat/auth-sat.module';

@Module({
  imports: [AuthSatModule],
  controllers: [OmnicanalidadController],
})
export class OmnicanalidadModule {}
