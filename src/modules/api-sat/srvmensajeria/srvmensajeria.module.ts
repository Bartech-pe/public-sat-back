import { Module } from '@nestjs/common';
import { SrvmensajeriaService } from './srvmensajeria.service';

@Module({
  providers: [SrvmensajeriaService],
  exports: [SrvmensajeriaService],
})
export class SrvmensajeriaModule {}
