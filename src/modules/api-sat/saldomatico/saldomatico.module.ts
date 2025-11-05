import { Module } from '@nestjs/common';
import { SaldomaticoController } from './saldomatico.controller';
import { SaldomaticoService } from './saldomatico.service';
import { SatProxy } from '@common/proxy/sat/sat.proxy';

@Module({
  controllers: [SaldomaticoController],
  providers: [SaldomaticoService, SatProxy],
  exports: [SaldomaticoService],
})
export class SaldomaticoModule {}
