import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoCampaniaDto } from './create-tipo-campania.dto';

export class UpdateTipoCampaniaDto extends PartialType(CreateTipoCampaniaDto) {}
