import { Injectable, NotFoundException } from "@nestjs/common";
import { MailCredential } from "../entities/mail-credentials.entity";
import { GenericCrudRepository } from "@common/repositories/generic-crud.repository";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class MailCredentialRepository extends GenericCrudRepository<MailCredential> {
    constructor(
        @InjectModel(MailCredential)
        model: typeof MailCredential,
    ) {
        super(model);
    }
    async getRefreshToken(email: string) {
        const exist = await this.findOne({ where: { email } })
        if (!exist) {
            throw new NotFoundException(`Email not found: ${email}`);
        }
        const existJson = exist.toJSON();
        if (!existJson.refreshToken) {
            throw new NotFoundException(`Refresh Token not found: ${email}`);
        }
        return existJson.refreshToken;
    }
    
}
