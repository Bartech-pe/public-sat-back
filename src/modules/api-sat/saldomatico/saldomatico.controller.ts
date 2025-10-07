import { Controller, Get, Param } from '@nestjs/common';
import { SaldomaticoService } from './saldomatico.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';

@ApiBearerAuth()
@Controller('saldomatico')
export class SaldomaticoController {
  constructor(private readonly service: SaldomaticoService) {}

  @Public()
  @Get('deudasInfo/:psiTipConsulta/:pvValor')
  async deudasInfo(
    @Param('psiTipConsulta') psiTipConsulta: string,
    @Param('pvValor') pvValor: string,
  ) {
    const response = await this.service.deudasInfo(
      psiTipConsulta,
      pvValor,
      '0',
      '23',
      '10',
    );
    return response;
  }

  @Public()
  @Get('impuestoPredial/:psiTipConsulta/:pvValor')
  async GetImpuestoPredial(
    @Param('psiTipConsulta') psiTipConsulta: string,
    @Param('pvValor') pvValor: string,
  ) {
    const response = await this.service.GetImpuestoPredial(
      pvValor,
      psiTipConsulta,
    );
    return response;
  }

  @Public()
  @Get('papeletaInfo/:psiTipConsulta/:pvValor')
  async papeletaInfo(
    @Param('psiTipConsulta') psiTipConsulta: string,
    @Param('pvValor') pvValor: string,
  ) {
    const response = await this.service.GetPapeletaInfo(
      pvValor,
      psiTipConsulta,
    );
    return response;
  }
}
