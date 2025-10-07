import { Module } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { Survey } from './entities/survey.entity';
import { SurveyRepository } from './repositories/survey.repository';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Survey])],
  controllers: [SurveyController],
  providers: [SurveyService,SurveyRepository],
  exports: [SurveyService, SurveyRepository],
})
export class SurveyModule {}

