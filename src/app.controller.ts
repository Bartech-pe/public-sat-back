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
}
