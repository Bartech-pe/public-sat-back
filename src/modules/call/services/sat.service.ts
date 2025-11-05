import { SatProxy } from '@common/proxy/sat/sat.proxy';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PapeletaInfoDto, TributoInfoDto } from '../dto/PapeletaInfoDto';

@Injectable()
export class SatService {
  constructor(private readonly satProxy: SatProxy) {}
  async GetPapeletaInfo(code: string, type: string): Promise<PapeletaInfoDto> {
    const papeletasProxy = await this.satProxy.GetPapeletasTributos(
      code,
      type,
      true,
    );
    if (!papeletasProxy.success || papeletasProxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sat genero un ${papeletasProxy.statusCode}`,
      );
    }
    let papeletas = papeletasProxy.element;
    const promise: PapeletaInfoDto = {
      total: 0,
      sum: 0,
      papeletas: [],
    };
    if (papeletas.length > 0) {
      papeletas = papeletas.filter((item) => item.concepto === 'Papeletas');
      const sum = papeletas.reduce((acc, element) => acc + element.monto, 0);
      const roundedSum = Math.round(sum * 100) / 100;
      promise.total = papeletas.length;
      promise.sum = roundedSum;
      promise.papeletas = papeletas;
    }
    return promise;
  }
  async GetTributoInfo(code: string, type: string): Promise<TributoInfoDto> {
    const papeletasProxy = await this.satProxy.GetPapeletasTributos(
      code,
      type,
      false,
    );
    if (!papeletasProxy.success || papeletasProxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sat genero un ${papeletasProxy.statusCode}`,
      );
    }
    let papeletas = papeletasProxy.element;
    const promise: TributoInfoDto = {
      total: 0,
      sum: 0,
      tributos: [],
    };
    if (papeletas.length > 0) {
      papeletas = papeletas.filter((item) => item.concepto !== 'Papeletas');
      const sum = papeletas.reduce((acc, element) => acc + element.monto, 0);
      const roundedSum = Math.round(sum * 100) / 100;
      promise.total = papeletas.length;
      promise.sum = roundedSum;
      promise.tributos = papeletas;
    }
    return promise;
  }
  async GetImpuestoPredial(pvValor:string,psiTipConsulta:string){
    const proxy = await this.satProxy.GetPapeletasTributos(pvValor,psiTipConsulta,false);
    if (!proxy.success || proxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sat genero un ${proxy.statusCode}`,
      );
    }
    let tributes = proxy.element;
    if(tributes.length>0){
       tributes = tributes.filter((item) => item.concepto == 'Imp. Predial');
    }
    return tributes;
  }
}
