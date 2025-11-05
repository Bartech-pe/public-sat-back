import { Module } from "@nestjs/common";
import { MonitorController } from "./monitor.controller";
import { MonitorService } from "./monitor.service";
import { GmailModule } from "@modules/gmail/gmail.module";
import { MultiChannelChatModule } from "@modules/multi-channel-chat/multi-channel-chat.module";
import { InboxModule } from "@modules/inbox/inbox.module";
import { MonitorVicidialService } from "./monitor-vicidial.service";
import { UserModule } from "@modules/user/user.module";

@Module({
  imports: [GmailModule,MultiChannelChatModule,InboxModule,UserModule],
  controllers: [MonitorController],
  providers: [MonitorService,MonitorVicidialService],
  exports: [],
})
export class MonitorModule {}