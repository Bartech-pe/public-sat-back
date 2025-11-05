import { Module } from '@nestjs/common';
import { SaldomaticoController } from './saldomatico.controller';
import { CallModule } from '@modules/call/call.module';

@Module({
  imports: [CallModule],
  controllers: [SaldomaticoController],
})
export class SaldomaticoModule {}
