import { PredefinedResponse } from './entities/predefined-response.entity';
import { Module } from '@nestjs/common';
import { PredefinedResponseService } from './predefined-response.service';
import { PredefinedResponseController } from './predefined-response.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PredefinedResponseRepository } from './repositories/predefined-response.repository';
@Module({
  imports: [SequelizeModule.forFeature([PredefinedResponse])],
  controllers: [PredefinedResponseController],
  providers: [PredefinedResponseService,PredefinedResponseRepository],
  exports: [PredefinedResponseRepository],
})
export class PredefinedResponseModule {}
