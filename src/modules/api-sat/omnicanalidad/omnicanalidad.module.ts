import { Module } from '@nestjs/common';
import { OmnicanalidadController } from './omnicanalidad.controller';
import { AuthSatModule } from '../auth-sat/auth-sat.module';
import { CitizenModule } from '@modules/citizen/citizen.module';

@Module({
  imports: [AuthSatModule, CitizenModule],
  controllers: [OmnicanalidadController],
})
export class OmnicanalidadModule {}
