import { Controller, Get } from '@nestjs/common';
import { CallStateService } from './services/callState.service';

@Controller('call-state')
export class CallStateController {
  constructor(private readonly service: CallStateService) {}
  @Get()
  async getAll() {
    const response = await this.service.findAll();
    return response;
  }
}
