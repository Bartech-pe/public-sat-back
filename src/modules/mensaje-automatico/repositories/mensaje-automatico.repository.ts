import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { MensajeAutomatico } from '../entities/mensaje-automatico.entity';

@Injectable()
export class MensajeAutomaticoRepository extends GenericCrudRepository<MensajeAutomatico> {
  constructor(
    @InjectModel(MensajeAutomatico)
    model: typeof MensajeAutomatico,
  ) {
    super(model);
  }
}
