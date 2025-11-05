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

@Controller('auth')
export class AuthController {
  constructor(
    private service: AuthService,
    private roleService: RoleService,
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
    return this.roleService.getScreenByIdAndScreen(user.idRole, dto?.url);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('screens')
  screensByRole(@CurrentUser() user: User) {
    return this.roleService.getScreensByRole(user.idRole);
  }
}
