import { Body, Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';

interface CitizenInfo {
  vcontacto: string;
  vnumTel: string;
  vtipDoc: string;
  vdocIde: string;
}

@Controller('')
export class AppController {

  @Get()
  redirectToDefault(@Res() res: Response) {
    return res.redirect('/es/');
  }

  @Get('omnicanalidad/contacto/listado/:psiTipConsulta/:piValPar1/:pvValPar2')
  getCitizenInfo(
    @Param('psiTipConsulta') psiTipConsulta: number,
    @Param('piValPar1') piValPar1: number,
    @Param('pvValPar2') pvValPar2: string,
  ): CitizenInfo[] {
    const list: CitizenInfo[] = [
      {
        vcontacto: 'Erik Huaman Guiop',
        vnumTel: '957586572',
        vtipDoc: 'DNI',
        vdocIde: '71193285',
      },
    ];
    return list.filter((l) => {
      if (psiTipConsulta == 1) {
        if (pvValPar2 === 'empty') {
          return l.vnumTel == piValPar1.toString();
        } else {
          return false;
        }
      } else {
        if (piValPar1 == 1 && l.vtipDoc === 'RUC') {
          return l.vdocIde === pvValPar2;
        } else if (piValPar1 == 2 && l.vtipDoc === 'DNI') {
          return l.vdocIde === pvValPar2;
        } else {
          return false;
        }
      }
    });
  }
}
