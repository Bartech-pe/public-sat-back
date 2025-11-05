import { Module } from '@nestjs/common';
import { MensajeriaService } from './email.service';
import { MessagingController } from './email.controller';

@Module({
  providers: [MensajeriaService],
  controllers: [MessagingController],
  exports: [MensajeriaService],
})
export class EmailsModule {}