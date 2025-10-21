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
  @Get('  /:psiTipConsulta/:pvValor')
  async GetImpuestoPredial(
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
    return response.filter(
      (item) => item.cuota != '0' && item.concepto == 'Imp. Predial',
    );
  }

  @Public()
  @Get('papeletaInfo/:psiTipConsulta/:pvValor')
  async papeletaInfo(
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
    return response.filter(
      (item) => item.cuota != '0' && item.concepto === 'Papeletas',
    );
  }

  @Public()
  @Get('impuestoVehicular/:psiTipConsulta/:pvValor')
  async impuestoVehicular(
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
    return response.filter(
      (item) => item.cuota != '0' && item.concepto === 'Imp. Vehicular',
    );
  }
}
