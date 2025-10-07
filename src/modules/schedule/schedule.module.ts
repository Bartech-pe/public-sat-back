import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Holiday } from './entities/holiday.entity';
import { Schedule } from './entities/schedule.entity';
import { HolidayController } from './controller/holiday.controller';
import { HolidayService } from './service/holiday.service';
import { ScheduleRepository } from './repositories/schedule.repository';
import { HolidayRepository } from './repositories/holiday.repository';
import { ScheduleController } from './controller/schedule.controller';
import { ScheduleService } from './service/schedule.service';
import { CentralTelefonicaModule } from '@modules/vicidial/central-telefonica/central-telefonica.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Schedule, Holiday]),
    forwardRef(() => CentralTelefonicaModule),
  ],
  controllers: [ScheduleController, ScheduleController, HolidayController],
  providers: [
    ScheduleService,
    HolidayService,
    ScheduleRepository,
    HolidayRepository,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
