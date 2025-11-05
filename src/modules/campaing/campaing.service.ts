import { Injectable } from '@nestjs/common';
import { CreateCampaingDto } from './dto/create-campaing.dto';
import { UpdateCampaingDto } from './dto/update-campaing.dto';

@Injectable()
export class CampaingService {
  create(createCampaingDto: CreateCampaingDto) {
    return 'This action adds a new campaing';
  }

  findAll() {
    return `This action returns all campaing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campaing`;
  }

  update(id: number, updateCampaingDto: UpdateCampaingDto) {
    return `This action updates a #${id} campaing`;
  }

  remove(id: number) {
    return `This action removes a #${id} campaing`;
  }
}
