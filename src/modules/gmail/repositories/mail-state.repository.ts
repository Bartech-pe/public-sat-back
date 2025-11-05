import { GenericCrudRepository } from "@common/repositories/generic-crud.repository";
import { MailState } from "../entities/mail-state.entity";
import { InjectModel } from "@nestjs/sequelize";
import { where } from "sequelize";
import { EmailStateEnum } from "../enum/email-state.enum";
import { Injectable } from "@nestjs/common";
@Injectable()
export class MailStateRepository extends GenericCrudRepository<MailState>{
    constructor(
            @InjectModel(MailState)
            model: typeof MailState,
        ) {
            super(model);
        }
    async getDraft(){
        return await this.model.findOne<MailState>({ where: { code: EmailStateEnum.DRAFT } });
    }
     async getTrash(){
        return await this.model.findOne<MailState>({ where: { code: EmailStateEnum.TRASH } });
    }
     async getSend(){
        return await this.model.findOne<MailState>({ where: { code: EmailStateEnum.SEND } });
    }
    async getSpam(){
        return await this.model.findOne<MailState>({ where: { code: EmailStateEnum.SPAM } });
    }
    async getReply(){
        return await this.model.findOne<MailState>({ where: { code: EmailStateEnum.REPLY } });
    }
    async getForward(){
        return await this.model.findOne<MailState>({ where: { code: EmailStateEnum.FORWARD } });
    }
}
