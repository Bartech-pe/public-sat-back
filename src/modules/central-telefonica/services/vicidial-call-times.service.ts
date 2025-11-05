import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { VicidialCallTimes } from "../entities/vicidial-call-times.entity";
import { UpdateVicidialCallTime, VicidialCallTimeBody } from "../dto/call-time/update-vicidial-call-time.dto";
import { VicidialCallTimesHolidays } from "../entities/vicidial-call-times-holidays.entity";
import { Op } from "sequelize";
import { HolidayCallTime, VicidialCallTimeDto } from "../dto/call-time/vicidial-call-time.dto";

@Injectable()
export class VicidialCallTimesService {
    constructor(
            @InjectModel(VicidialCallTimes, 'central')
            private readonly model: typeof VicidialCallTimes,
            @InjectModel(VicidialCallTimesHolidays, 'central')
            private readonly modelHoliday: typeof VicidialCallTimesHolidays,
    ) { }
    async UpdateCallTime(call_time_id: string, body: UpdateVicidialCallTime) {
        try {
            const exist = await this.model.findOne({
                where: { call_time_id },
            });
            if (!exist) {
                return { status: 'not_found' };
            }
            const callTime = exist.toJSON();
            let holidayText:null|string = null;
            if(body.holidays && body.holidays.length>0){
               holidayText = `|${body.holidays.join('|')}|`;
            }
            if(body.everyday){
                const evetydayBody:VicidialCallTimeBody={
                    call_time_name: body.call_time_name ??callTime.call_time_name,
                    call_time_comments: body.call_time_name ?? callTime.call_time_comments,
                    ct_default_start: body.start ?? callTime.ct_default_start,
                    ct_default_stop: body.end ?? callTime.ct_default_stop,
                    ct_sunday_start: 0,
                    ct_sunday_stop: 0,
                    ct_monday_start: 0,
                    ct_monday_stop: 0,
                    ct_tuesday_start: 0,
                    ct_tuesday_stop: 0,
                    ct_wednesday_start: 0,
                    ct_wednesday_stop: 0,
                    ct_thursday_start: 0,
                    ct_thursday_stop: 0,
                    ct_friday_start: 0,
                    ct_friday_stop: 0,
                    ct_saturday_start: 0,
                    ct_saturday_stop: 0,
                    ct_holidays: holidayText ?? callTime.ct_holidays
                }
                exist.update(evetydayBody)
            }else{
                const selectedBody:VicidialCallTimeBody={
                    call_time_name: body.call_time_name ??callTime.call_time_name,
                    call_time_comments: body.call_time_name ?? callTime.call_time_comments,
                    ct_default_start: callTime.ct_default_start,
                    ct_default_stop: callTime.ct_default_stop,
                    ct_sunday_start: body.sundayStart ?? callTime.ct_sunday_start,
                    ct_sunday_stop: body.sundayEnd ?? callTime.ct_sunday_stop,
                    ct_monday_start: body.mondayStart ?? callTime.ct_monday_start,
                    ct_monday_stop: body.mondayEnd ?? callTime.ct_monday_stop,
                    ct_tuesday_start: body.tuesdayStart ?? callTime.ct_tuesday_start,
                    ct_tuesday_stop: body.tuesdayEnd ?? callTime.ct_tuesday_stop,
                    ct_wednesday_start: body.wednesdayStart ?? callTime.ct_wednesday_start,
                    ct_wednesday_stop:  body.wednesdayEnd ?? callTime.ct_wednesday_stop,
                    ct_thursday_start:  body.thursdayStart ?? callTime.ct_thursday_start,
                    ct_thursday_stop: body.thursdayEnd ?? callTime.ct_thursday_stop,
                    ct_friday_start:  body.fridaydayStart ?? callTime.ct_friday_start,
                    ct_friday_stop:  body.fridayEnd ?? callTime.ct_friday_stop,
                    ct_saturday_start: body.saturdayStart ?? callTime.ct_saturday_start,
                    ct_saturday_stop:  body.saturdayEnd ?? callTime.ct_saturday_stop,
                    ct_holidays: holidayText ?? callTime.ct_holidays
                }
                exist.update(selectedBody)
            }
            return {
                status: 'updated',
                data: exist,
            };
        } catch (error) {
            throw new InternalServerErrorException(
                error,
                'Error interno del servidor',
            );
        }
    }
    async GetCallTime(call_time_id: string){
        const exist = await this.model.findOne({
            where: { call_time_id },
        });
        if (!exist) {
            return { status: 'not_found' };
        }
        const callTime = exist.toJSON();
        const findHolidays:string[] = callTime.ct_holidays.split("|").filter(Boolean);
        const existHolidays = await this.modelHoliday.findAll({where:{
            holiday_id:{
                 [Op.in]: findHolidays
            }
        }})
        const holidays:HolidayCallTime[] = existHolidays.map(a=>a.toJSON())
        const body:VicidialCallTimeDto={
            call_time_id: callTime.call_time_id,
            call_time_name: callTime.call_time_name,
            call_time_comments: callTime.call_time_comments,
            ct_default_start: callTime.ct_default_start,
            ct_default_stop: callTime.ct_default_stop,
            ct_sunday_start: callTime.ct_sunday_start,
            ct_sunday_stop: callTime.ct_sunday_stop,
            ct_monday_start: callTime.ct_monday_start,
            ct_monday_stop: callTime.ct_monday_stop,
            ct_tuesday_start: callTime.ct_tuesday_start,
            ct_tuesday_stop: callTime.ct_tuesday_stop,
            ct_wednesday_start: callTime.ct_wednesday_start,
            ct_wednesday_stop: callTime.ct_wednesday_stop,
            ct_thursday_start: callTime.ct_thursday_start,
            ct_thursday_stop: callTime.ct_thursday_stop,
            ct_friday_start: callTime.ct_friday_start,
            ct_friday_stop: callTime.ct_friday_stop,
            ct_saturday_start: callTime.ct_saturday_start,
            ct_saturday_stop: callTime.ct_saturday_stop,
            ct_holidays: holidays
        }
        return body;

    }
}
