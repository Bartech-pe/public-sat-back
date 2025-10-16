import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { LoginDTO } from './dto/login.dto';
import { VerifyScreenDTO } from './dto/verify-screen.dto';
import { Public } from '@common/decorators/public.decorator';
import { ScreenService } from '@modules/screen/screen.service';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { AloSatService } from '@modules/vicidial/central-telefonica/services/alo-sat.service';
import { ChannelPhoneState } from '@common/enums/status-call.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private service: AuthService,
    private screenService: ScreenService,
    private readonly vicidialUserRepository: VicidialUserRepository,
    private readonly aloSatService: AloSatService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Public()
  @Post('login')
  async login(
    @Request() req,
    @Body() dto: LoginDTO,
  ): Promise<{ accessToken: string }> {
    return this.service.login(req.user.toJSON(), dto.rememberMe);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('verify-access')
  verifyAccess(@CurrentUser() user: User, @Body() dto: VerifyScreenDTO) {
    return this.screenService.getScreenByIdAndScreen(
      user.roleId,
      user.officeId,
      dto?.url,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('screens')
  screensByRole(@CurrentUser() user: User): Promise<any[]> {
    return this.screenService.getScreensByRoleAndOffice(
      user.roleId,
      user.officeId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('logout')
  async logout(@CurrentUser() user: User) {
    try {
      const res = await this.aloSatService.agentLogout(user.id);
      const vicidialUser = await this.vicidialUserRepository.findOne({
        where: { userId: user.id },
      });
      await vicidialUser?.update({
        channelStateId: ChannelPhoneState.OFFLINE,
        pauseCode: null,
      });
      return res;
    } catch (error) {}
  }
}
