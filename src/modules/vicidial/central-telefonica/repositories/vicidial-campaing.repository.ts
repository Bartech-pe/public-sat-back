import { Injectable } from '@nestjs/common';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class VicidialCampaingRepository {
  constructor(
    @InjectModel(VicidialCampaign, 'central')
    private readonly model: typeof VicidialCampaign,
  ) {}

  getModel() {
    return this.model;
  }
}
