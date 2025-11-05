import { GenericCrudRepository } from "@common/repositories/generic-crud.repository";
import { InjectModel } from "@nestjs/sequelize";
import { Injectable } from "@nestjs/common";
import { Mail } from "../entities/mail.entity";
@Injectable()
export class MailRepository extends GenericCrudRepository<Mail>{
    constructor(
            @InjectModel(Mail)
            model: typeof Mail,
        ) {
            super(model);
        }
}
