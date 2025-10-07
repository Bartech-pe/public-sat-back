import { forwardRef, Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SMSProxy } from '@common/proxy/sms/sms.proxy';

@Module({
  controllers: [SmsController],
  providers: [SMSProxy, SmsService],
  exports: [SMSProxy, SmsService],
})
export class SmsModule {}
