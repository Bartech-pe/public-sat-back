import { Controller, Get, Param } from "@nestjs/common";
import { SatService } from "./services/sat.service";

@Controller('saldomatico')
export class SatController {
    constructor(private readonly satService:SatService){}
    @Get('impuesto-predial/:psiTipConsulta/:pvValor')
    async ImpuestoPredialInfo(@Param('psiTipConsulta') psiTipConsulta: string,@Param('pvValor') pvValor: string) {
        const response = await this.satService.GetImpuestoPredial(pvValor,psiTipConsulta);
        return response;
    }
}
