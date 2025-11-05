import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { ChannelCitizen } from '../entities/channel-citizen.entity';

@Injectable()
export class ChannelCitizenRepository extends GenericCrudRepository<ChannelCitizen> {
  constructor(
    @InjectModel(ChannelCitizen)
    model: typeof ChannelCitizen,
  ) {
    super(model);
  }
}
