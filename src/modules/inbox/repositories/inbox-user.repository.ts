import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InboxUser } from '../entities/inbox-user.entity';

@Injectable()
export class InboxUserRepository extends GenericCrudRepository<InboxUser> {
  constructor(
    @InjectModel(InboxUser)
    model: typeof InboxUser,
  ) {
    super(model);
  }

  async reassignUser(
    inboxId: number,
    currentUserId: number,
    newUserId: number,
  ): Promise<void> {
    const exists = await this.model.findOne({
      where: { inboxId: inboxId, userId: newUserId } as Partial<InboxUser>,
    });
    if (exists)
      throw new BadRequestException(
        'El nuevo asesor ya está asignado al canal.',
      );

    const [count] = await this.model.update(
      { userId: newUserId },
      {
        where: {
          inboxId: inboxId,
          userId: currentUserId,
        } as Partial<InboxUser>,
      },
    );

    if (count === 0) {
      throw new NotFoundException(
        'No se encontró la asignación actual del asesor.',
      );
    }
  }
}
