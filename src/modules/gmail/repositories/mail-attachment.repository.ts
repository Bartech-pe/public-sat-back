import { GenericCrudRepository } from "@common/repositories/generic-crud.repository";
import { MailAttachment } from "../entities/mail-attachment.entity";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
@Injectable()
export class MailAttachmentRepository extends GenericCrudRepository<MailAttachment> {
    constructor(
        @InjectModel(MailAttachment)
        model: typeof MailAttachment,
    ) {
        super(model);
    }
}
