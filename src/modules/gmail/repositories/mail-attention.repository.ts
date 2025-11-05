import { GenericCrudRepository } from "@common/repositories/generic-crud.repository";
import { InjectModel } from "@nestjs/sequelize";
import { MailAttention } from "../entities/mail-attention.entity";
import { Injectable } from "@nestjs/common";
import { CountOptions } from "sequelize";

@Injectable()

export class MailAttentionRepository extends GenericCrudRepository<MailAttention> {
    sequelize: any;
    constructor(
        @InjectModel(MailAttention)
        model: typeof MailAttention,
    ) {
        super(model);
    }
    async count(options?: Omit<CountOptions<{}>, 'group'>) {
        return await this.model.count(options);
    }
    
}
