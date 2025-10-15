import { Controller, Get, Param } from '@nestjs/common';
import { MetabaseService } from './metabase.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('metabase')
export class MetabaseController {
  constructor(private readonly service: MetabaseService) {}

  @Get('dashboard/:id')
  findAll(@CurrentUser() user: User, @Param('id') id: number) {
    const url = this.service.generateDashboardUrl(id);
    return { url };
  }
}
