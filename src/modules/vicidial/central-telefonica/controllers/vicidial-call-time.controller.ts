import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { VicidialCallTimesService } from "../services/vicidial-call-times.service";
import { VicidialCallTimeDto } from "../dto/call-time/vicidial-call-time.dto";
import { UpdateVicidialCallTime } from "../dto/call-time/update-vicidial-call-time.dto";

@Controller('vicidial-call-time')
export class VicidialCallTimeController {
    constructor(private readonly service: VicidialCallTimesService) { }
    @Get('/:call_time_id')
    find(@Param('call_time_id') call_time_id: string): Promise<VicidialCallTimeDto | {
        status: string;
    }> {
        return this.service.GetCallTime(call_time_id);
    }
    @Put('/:call_time_id')
    update(@Param('call_time_id') call_time_id: string, @Body() dto: UpdateVicidialCallTime){
        return this.service.UpdateCallTime(call_time_id,dto)
    }
}
