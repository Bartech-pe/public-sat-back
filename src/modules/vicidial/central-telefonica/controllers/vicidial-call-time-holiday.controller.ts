import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { VicidialCallTimesHolidaysService } from "../services/vicidial-call-times-holidays.service";
import { CreateVicidalCallTimeHoliday } from "../dto/holiday/createvicidalcalltimeholiday";

@Controller('vicidial-call-time')
export class VicidialCallTimeHolidayController {
    constructor(private readonly service: VicidialCallTimesHolidaysService) { }
    @Get()
    async find() {
        return await this.service.GetHolidays();
    }
    @Post()
    async createHoliday(@Body() body:CreateVicidalCallTimeHoliday){
       return await this.service.createHoliday(body);
    }

}
