import { Module } from '@nestjs/common';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';
import { MultiChannelChatModule } from '@modules/multi-channel-chat/multi-channel-chat.module';
import { InboxModule } from '@modules/inbox/inbox.module';
import { MonitorVicidialService } from './monitor-vicidial.service';
import { EmailModule } from '@modules/email/email.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [MultiChannelChatModule, InboxModule, EmailModule, UserModule],
  controllers: [MonitorController],
  providers: [MonitorService, MonitorVicidialService],
  exports: [],
})
export class MonitorModule {}
