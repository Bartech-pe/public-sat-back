import { forwardRef, Module } from '@nestjs/common';
import { AssistanceStateService } from './assistance-state.service';
import { AssistanceStateController } from './assistance-state.controller';
import { AssistanceState } from './entities/assistance-state.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AssistanceStateRepository } from './repositories/assistance-state.repository';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [
    SequelizeModule.forFeature([AssistanceState]),
    forwardRef(() => EmailModule),
  ],
  controllers: [AssistanceStateController],
  providers: [AssistanceStateService, AssistanceStateRepository],
  exports: [AssistanceStateService, AssistanceStateRepository],
})
export class AssistanceStateModule {}
