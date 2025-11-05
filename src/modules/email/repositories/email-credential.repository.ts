import { Injectable, NotFoundException } from '@nestjs/common';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InjectModel } from '@nestjs/sequelize';
import { EmailCredential } from '../entities/email-credentials.entity';

@Injectable()
export class EmailCredentialRepository extends GenericCrudRepository<EmailCredential> {
  constructor(
    @InjectModel(EmailCredential)
    model: typeof EmailCredential,
  ) {
    super(model);
  }
  
  async getRefreshToken(email: string) {
    const exist = await this.findOne({ where: { email } });
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
