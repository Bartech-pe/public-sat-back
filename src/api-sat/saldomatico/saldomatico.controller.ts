import { SatService } from '@modules/call/services/sat.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('saldomatico')
export class SaldomaticoController {
  constructor(private readonly satService: SatService) {}

  @Get('impuestoPredial/:psiTipConsulta/:pvValor')
  async impuestoPredialInfo(
    @Param('psiTipConsulta') psiTipConsulta: string,
    @Param('pvValor') pvValor: string,
  ) {
    const response = await this.satService.GetImpuestoPredial(
      pvValor,
      psiTipConsulta,
    );
    return response;
  }

  @Get('papeletaInfo/:psiTipConsulta/:pvValor')
  async papeletaInfo(
    @Param('psiTipConsulta') psiTipConsulta: string,
    @Param('pvValor') pvValor: string,
  ) {
    const response = await this.satService.GetPapeletaInfo(
      pvValor,
      psiTipConsulta,
    );
    return response.papeletas;
  }
}
