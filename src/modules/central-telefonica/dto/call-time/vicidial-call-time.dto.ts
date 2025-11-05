export class VicidialCallTimeDto {
    call_time_id:string;
    call_time_name: string;
    call_time_comments: string;
    ct_default_start: number
    ct_default_stop: number
    ct_sunday_start: number
    ct_sunday_stop: number
    ct_monday_start: number
    ct_monday_stop: number
    ct_tuesday_start: number
    ct_tuesday_stop: number
    ct_wednesday_start: number
    ct_wednesday_stop: number
    ct_thursday_start: number
    ct_thursday_stop: number
    ct_friday_start: number
    ct_friday_stop: number
    ct_saturday_start: number
    ct_saturday_stop: number
    ct_holidays: HolidayCallTime[]
}
export class HolidayCallTime {
    holiday_id:string;
    holiday_name:string;
    holiday_date:Date
}
