import { Module } from '@nestjs/common';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';
import { MultiChannelChatModule } from '@modules/multi-channel-chat/multi-channel-chat.module';
import { InboxModule } from '@modules/inbox/inbox.module';
import { MonitorVicidialService } from './monitor-vicidial.service';
import { EmailModule } from '@modules/email/email.module';
import { UserModule } from '@modules/user/user.module';
import { CallModule } from '@modules/call/call.module';

@Module({
  imports: [
    MultiChannelChatModule,
    InboxModule,
    EmailModule,
    UserModule,
    CallModule,
  ],
  controllers: [MonitorController],
  providers: [MonitorService, MonitorVicidialService],
  exports: [],
})
export class MonitorModule {}
