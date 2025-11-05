import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { AloSatService } from '../services/alo-sat.service';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { PauseAgentDto } from '../dto/pause-agent.dto';
import { LoginAgentDto } from '../dto/login-agent.dto';

@Controller('alosat')
export class AloSatController {
  constructor(private readonly service: AloSatService) {}

  @Get('campaigns')
  findAll(@CurrentUser() user: User): Promise<VicidialCampaign[]> {
    return this.service.findAllCampaigns(user.id);
  }

  @Get('agent-status')
  agentStatus(@CurrentUser() user: User): Promise<any> {
    return this.service.agentStatus(user.id);
  }

  @Post('agent-login')
  agentLogin(
    @CurrentUser() user: User,
    @Body() dto: LoginAgentDto,
  ): Promise<any> {
    console.log('dto', dto);
    return this.service.agentLogin(user.id, dto.idCampaign);
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
    console.log("dto", dto);
    return this.service.transferCall(user.id, dto.idUser);
  }
}
