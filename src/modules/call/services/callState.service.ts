import { CallState } from '../entities/callState.entity';
import { CallStateRepository } from './../repositories/callState.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CallStateService {
  constructor(private readonly callStateRepository: CallStateRepository) {}
  async findAll(): Promise<CallState[]> {
    const states = await this.callStateRepository.findAll({
      attributes: ['callStateId', 'name', 'icon'],
      order: [['name', 'ASC']],
    });
    return states;
  }
}
