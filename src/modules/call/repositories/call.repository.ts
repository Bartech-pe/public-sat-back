import { Injectable } from '@nestjs/common';
import { Call } from '../entities/call.entity';
import { GenericCrudRepository } from '@common/repositories/generic-crud.repository';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class CallRepository extends GenericCrudRepository<Call> {
  constructor(
    @InjectModel(Call)
    model: typeof Call,
  ) {
    super(model);
  }
  async UploadRecording(id: number, recording: string) {
     const call = await this.findOne({ where: { id } });
    if (!call) {
       return null;
    }
    console.log('UploadRecording')
    return this.update(id, { recording });
  }
}
