import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InboxUser, InboxUserAttributes } from '../entities/inbox-user.entity';

@Injectable()
export class InboxUserRepository extends GenericCrudRepository<InboxUser> {
  
  constructor(
    @InjectModel(InboxUser)
    model: typeof InboxUser,
  ) {
    super(model);
  }

  async reassignUser(inboxId: number, currentUserId: number, newUserId: number): Promise<void> {
    const exists = await this.model.findOne({ where: { idInbox: inboxId, idUser: newUserId } as Partial<InboxUserAttributes> });
    if (exists) throw new BadRequestException('El nuevo asesor ya está asignado al canal.');

    const [count] = await this.model.update(
      { idUser: newUserId },
      { where: { idInbox: inboxId, idUser: currentUserId } as Partial<InboxUserAttributes>}
    );

    if (count === 0) {
      throw new NotFoundException('No se encontró la asignación actual del asesor.');
    }
  }
  async changeAttention(inboxId: number, userId: number,stateChannelId:number) {
    const exist = await this.model.findOne({ where: { idInbox: inboxId, idUser: userId } as Partial<InboxUserAttributes> });
    if (!exist) throw new NotFoundException("No se halló la credencial ")
    const [count] = await this.model.update(
      {stateChannelId : stateChannelId },
      { where: { idInbox: inboxId, idUser: userId } as Partial<InboxUserAttributes> }
    );

    if (count === 0) {
      throw new NotFoundException('No se encontró la asignación actual del asesor.');
    }
  }
}
