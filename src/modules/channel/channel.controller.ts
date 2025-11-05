import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CreateChannelUserDto } from './dto/create-channel-user.dto';

@Controller('Channels')
export class ChannelController {
  constructor(private readonly service: ChannelService) {}
  
    @Get()
    findAll(
      @Query() query: PaginationQueryDto,
    ): Promise<PaginatedResponse<Channel>> {
      const limit = query.limit!;
      const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }
  
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Channel> {
      return this.service.findOne(+id);
    }
  
    @Post()
    create(@Body() dto: CreateChannelDto): Promise<Channel> {
      return this.service.create(dto);
    }
  
    // @Post('assignment/:id')
    // assignment(
    //   @Param('id') id: number,
    //   @Body() dto: CreateChannelUserDto[],
    // ): Promise<ChannelUser[]> {
    //   return this.service.assignment(id, dto);
    // }
  
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateChannelDto): Promise<Channel> {
      return this.service.update(+id, dto);
    }
  
    @Put('toggleStatus/:id')
    toggleStatus(@Param('id') id: number): Promise<Channel> {
      return this.service.toggleStatus(id);
    }
  
    @Delete(':id')
    remove(@Param('id') id: number) {
      return this.service.remove(+id);
    }
}
