import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { AloSatService } from '../services/alo-sat.service';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { PauseAgentDto } from '../dto/pause-agent.dto';
import { LoginAgentDto } from '../dto/login-agent.dto';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';

@Controller('alosat')
export class AloSatController {
  constructor(
    private readonly service: AloSatService,
    private readonly vicidialUserRepository: VicidialUserRepository,
  ) {}

  @Get('campaigns')
  findAll(@CurrentUser() user: User): Promise<VicidialCampaign[]> {
    return this.service.findAllCampaigns(user.id);
  }

  @Get('agent-status')
  async agentStatus(@CurrentUser() user: User): Promise<ChannelState> {
    return (await this.vicidialUserRepository.getAloSatState(user))?.toJSON()
      ?.channelState;
  }

  @Post('agent-login')
  async agentLogin(
    @CurrentUser() user: User,
    @Body() dto: LoginAgentDto,
  ): Promise<any> {
    console.log('dto', dto);
    const res = await this.service.agentLogin(user.id, dto.idCampaign);
    const vicidialUser = await this.vicidialUserRepository.findOne({
      where: { userId: user.id },
    });
    await vicidialUser?.update({
      channelStateId: 1,
    });
    return res;
  }

  @Get('agent-logout')
  agentLogout(@CurrentUser() user: User): Promise<any> {
    return this.service.agentLogout(user.id);
  }

  @Post('pause-agent')
  pauseAgent(
    @CurrentUser() user: User,
    @Body() dto: PauseAgentDto,
  ): Promise<any> {
    return this.service.pauseAgent(user.id, dto.pauseCode);
  }

  @Get('resume-agent')
  resumeAgent(@CurrentUser() user: User): Promise<any> {
    return this.service.resumeAgent(user.id);
  }

  @Get('end-call')
  endCall(@CurrentUser() user: User): Promise<any> {
    return this.service.endCall(user.id);
  }

  @Post('transfer-call')
  transferCall(@CurrentUser() user: User, @Body() dto: any): Promise<any> {
    console.log('dto', dto);
    return this.service.transferCall(user.id, dto.userId);
  }
}
