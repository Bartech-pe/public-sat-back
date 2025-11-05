import { Module } from '@nestjs/common';
import { ScreenService } from './screen.service';
import { ScreenController } from './screen.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScreenRepository } from './repositories/screen.repository';
import { Screen } from './entities/screen.entity';

@Module({
  imports: [SequelizeModule.forFeature([Screen])],
  controllers: [ScreenController],
  providers: [ScreenService, ScreenRepository],
  exports: [ScreenRepository],
})
export class ScreenModule {}
