import { Module } from '@nestjs/common';
import { AssistanceStateService } from './assistance-state.service';
import { AssistanceStateController } from './assistance-state.controller';
import { AssistanceState } from './entities/assistance-state.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AssistanceStateRepository } from './repositories/assistance-state.repository';

@Module({
  imports: [SequelizeModule.forFeature([AssistanceState])],
  controllers: [AssistanceStateController],
  providers: [AssistanceStateService, AssistanceStateRepository],
  exports: [AssistanceStateService, AssistanceStateRepository],
})
export class AssistanceStateModule {}
