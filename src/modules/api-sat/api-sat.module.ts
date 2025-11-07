import { Module } from '@nestjs/common';
import { SaldomaticoModule } from './saldomatico/saldomatico.module';
import { OmnicanalidadModule } from './omnicanalidad/omnicanalidad.module';
import { AuthSatModule } from './auth-sat/auth-sat.module';
import { SrvmensajeriaModule } from './srvmensajeria/srvmensajeria.module';

@Module({
  imports: [
    SaldomaticoModule,
    OmnicanalidadModule,
    AuthSatModule,
    SrvmensajeriaModule,
  ],
})
export class ApiSatModule {}
