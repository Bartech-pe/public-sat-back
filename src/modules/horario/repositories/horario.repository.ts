import { Injectable } from "@nestjs/common";
import { Horario } from "../entities/horario.entity";
import { InjectModel } from "@nestjs/sequelize";
import { GenericCrudRepository } from "@common/repositories/generic-crud.repository";


@Injectable()
export class HorarioRepository extends GenericCrudRepository<Horario> {
  constructor(
    @InjectModel(Horario)
    model: typeof Horario,
  ) {
      super(model);
  }
}