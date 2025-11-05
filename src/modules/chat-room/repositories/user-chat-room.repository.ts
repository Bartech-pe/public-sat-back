import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { UserChatRoom } from '../entities/user-chat-room.entity';

@Injectable()
export class UserChatRoomRepository extends GenericCrudRepository<UserChatRoom> {
  constructor(
    @InjectModel(UserChatRoom)
    model: typeof UserChatRoom,
  ) {
    super(model);
  }


  async deleteUserGroup(chatRoomId: number, deletedBy?: number): Promise<void> {
    await this.model.update(
      {
        deletedBy: deletedBy ?? null,
        isActive: false,
        status: false,
      },
      {
        where: { chatRoomId } as any, 
      },
    );

    await this.model.destroy({
      where: { chatRoomId } as any, 
    });
  }


}
