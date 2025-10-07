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
import { RoleService } from '@modules/role/role.service';
import { VerifyScreenDTO } from './dto/verify-screen.dto';
import { Public } from '@common/decorators/public.decorator';
import { ScreenService } from '@modules/screen/screen.service';
import { Screen } from '@modules/screen/entities/screen.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private service: AuthService,
    private roleService: RoleService,
    private screenService: ScreenService,
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
    // if (user.roleId === 1) {
    //   return this.screenService.getScreenByIdAndScreen(
    //     user.roleId,
    //     user.officeId,
    //     dto?.url,
    //   );
    // } else {
    //   return this.roleService.getScreenByIdAndScreen(
    //     user.roleId,
    //     user.officeId,
    //     dto?.url,
    //   );
    // }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('screens')
  screensByRole(@CurrentUser() user: User): Promise<any[]> {
    return this.screenService.getScreensByRoleAndOffice(
        user.roleId,
        user.officeId,
      );
    // if (user.roleId === 1) {
    //   return this.screenService.getScreensByRoleAndOffice(
    //     user.roleId,
    //     user.officeId,
    //   );
    // } else {
    //   return this.roleService.getScreensByRoleAndOffice(
    //     user.roleId,
    //     user.officeId,
    //   );
    // }
  }
}
