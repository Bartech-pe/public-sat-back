import { CallState } from '../entities/call-state.entity';
import { CallStateRepository } from '../repositories/call-state.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CallStateService {
  constructor(private readonly callStateRepository: CallStateRepository) {}
  async findAll(): Promise<CallState[]> {
    const states = await this.callStateRepository.findAll({
      order: [['name', 'ASC']],
    });
    return states;
  }
}
