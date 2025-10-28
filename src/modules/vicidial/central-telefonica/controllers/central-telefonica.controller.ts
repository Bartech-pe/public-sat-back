import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { VicidialUserService } from '../services/vicidial-user.service';
import { VicidialUser } from '../entities/vicidial-user.entity';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { CreateVicidialCampaignDto } from '../dto/create-vicidial-campaing.dto';
import { UpdateVicidialCampaignDto } from '../dto/update-vicidial-campaing.dto';

@Controller('central')
export class CentralTelefonicaController {
  constructor(private readonly service: VicidialUserService) {}

  @Get('agentes')
  findAll(): Promise<VicidialUser[]> {
    return this.service.findAll();
  }

  @Get('campanias/getbyid/:id')
  getById(@Param('id') campaign_id: string) {
    return this.service.getByIdCampain(campaign_id);
  }

  @Get('campanign')
  getCampaignAll(): Promise<VicidialCampaign[]>  {
    return this.service.getCampaignAll();
  }

  @Post('campanias')
  create(@Body() body: CreateVicidialCampaignDto) {
     return this.service.createCampaign(body);
  }

  @Patch('campanias/:campaign_id')
  update(@Param('campaign_id') campaign_id: string, @Body() dto: UpdateVicidialCampaignDto){
      return this.service.updateCampaign(campaign_id, dto);
  }

  @Delete('campanias/:campaign_id')
  delete(@Param('campaign_id') campaign_id: string) {
    return this.service.deleteCampaign(campaign_id);
  }

  @Get('campanias/progreso/:id')
  getProgreso(@Param('id') campaign_id: string) {
    return this.service.getProgreso(campaign_id);
  }

  @Get('remote_agents/:id')
  getVicidialRemoteAgents(@Param('id') campaignId:any ) {
    return this.service.getVicidialRemoteAgents(campaignId);
  }

  @Get('campanias/list/:id')
  getListProgress(@Param('id') listId: number) {
    return this.service.getListProgress(listId);
  }

 


}
