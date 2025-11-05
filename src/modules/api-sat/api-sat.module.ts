import { Module } from '@nestjs/common';
import { SaldomaticoModule } from './saldomatico/saldomatico.module';
import { OmnicanalidadModule } from './omnicanalidad/omnicanalidad.module';
import { AuthSatModule } from './auth-sat/auth-sat.module';

@Module({
  imports: [SaldomaticoModule, OmnicanalidadModule, AuthSatModule],
})
export class ApiSatModule {}
