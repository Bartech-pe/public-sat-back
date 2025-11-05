import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CampaingService } from './campaing.service';
import { CreateCampaingDto } from './dto/create-campaing.dto';
import { UpdateCampaingDto } from './dto/update-campaing.dto';

@Controller('campaing')
export class CampaingController {
  constructor(private readonly campaingService: CampaingService) {}

  @Post()
  create(@Body() createCampaingDto: CreateCampaingDto) {
    return this.campaingService.create(createCampaingDto);
  }

  @Get()
  findAll() {
    return this.campaingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampaingDto: UpdateCampaingDto) {
    return this.campaingService.update(+id, updateCampaingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaingService.remove(+id);
  }
}
