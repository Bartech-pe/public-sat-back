import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InjectModel } from '@nestjs/sequelize';
import { EmailStateEnum } from '../enum/email-state.enum';
import { Injectable } from '@nestjs/common';
import { EmailState } from '../entities/email-state.entity';

@Injectable()
export class EmailStateRepository extends GenericCrudRepository<EmailState> {
  constructor(
    @InjectModel(EmailState)
    model: typeof EmailState,
  ) {
    super(model);
  }

  async getDraft() {
    return await this.model.findOne<EmailState>({
      where: { code: EmailStateEnum.DRAFT },
    });
  }

  async getTrash() {
    return await this.model.findOne<EmailState>({
      where: { code: EmailStateEnum.TRASH },
    });
  }

  async getSend() {
    return await this.model.findOne<EmailState>({
      where: { code: EmailStateEnum.SEND },
    });
  }

  async getSpam() {
    return await this.model.findOne<EmailState>({
      where: { code: EmailStateEnum.SPAM },
    });
  }

  async getReply() {
    return await this.model.findOne<EmailState>({
      where: { code: EmailStateEnum.REPLY },
    });
  }

  async getForward() {
    return await this.model.findOne<EmailState>({
      where: { code: EmailStateEnum.FORWARD },
    });
  }
}
