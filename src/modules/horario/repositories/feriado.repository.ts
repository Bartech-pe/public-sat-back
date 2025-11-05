
import { InjectModel } from "@nestjs/sequelize";
import { GenericCrudRepository } from "@common/repositories/generic-crud.repository";
import { Feriado } from "../entities/feriado.entity";
import { Injectable } from "@nestjs/common";


@Injectable()
export class FeriadoRepository extends GenericCrudRepository<Feriado> {
  constructor(
    @InjectModel(Feriado)
    model: typeof Feriado,
  ) {
      super(model);
  }
}  
