import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVicidalCallTimeHoliday } from '../dto/holiday/createvicidalcalltimeholiday';
import { VicidialCallTimesHolidaysRepository } from '../repositories/vicidial-call-times-holidays.repository';

@Injectable()
export class VicidialCallTimesHolidaysService {
  constructor(private readonly repo: VicidialCallTimesHolidaysRepository) {}
  async createHoliday(body: CreateVicidalCallTimeHoliday) {
    try {
      const holiday_id = body.holiday_id;
      const { holiday_name, holiday_date, start, end } = body;
      const holiday_comments = body.holiday_comments ?? '';
      const default_afterhours_filename_override = '';
      const user_group = '---ALL---';
      const holiday_method = 'REPLACE';
      const existing = await this.repo
        .getModel()!
        .findOne({ where: { holiday_id } });
      const holiday_status = 'ACTIVE';
      const ct_default_start = start;
      const ct_default_stop = end;
      if (existing) {
        return {
          status: 'exists',
          data: existing,
        };
      }
      const created = await this.repo.getModel()!.create({
        holiday_id,
        holiday_name,
        holiday_comments,
        holiday_date,
        holiday_status,
        ct_default_start,
        ct_default_stop,
        default_afterhours_filename_override,
        user_group,
        holiday_method,
      });
      return {
        status: 'created',
        data: created,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  async GetHolidays() {
    const data = await this.repo.getModel()!.findAll();
    const holidays = data.map((a) => a.toJSON());
    return holidays;
  }
}
