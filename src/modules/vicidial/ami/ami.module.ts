import { forwardRef, Module } from '@nestjs/common';
import { AMIGateway } from './ami.gateway';
import { AmiService } from './ami.service';
import { CallModule } from '@modules/call/call.module';
import { UserModule } from '@modules/user/user.module';
import { CentralTelefonicaModule } from '../central-telefonica/central-telefonica.module';

@Module({
  imports: [
    forwardRef(() => CallModule),
    UserModule,
    forwardRef(() => CentralTelefonicaModule),
  ],
  providers: [AmiService, AMIGateway],
  exports: [AmiService],
})
export class AmiModule {}
