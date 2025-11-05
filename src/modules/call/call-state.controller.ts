import { Controller, Get } from '@nestjs/common';
import { CallStateService } from './services/call-state.service';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller for managing Call States.
 *
 * Exposes RESTful endpoints to perform CRUD operations, pagination,
 * status toggling, and soft deletion for Call States.
 */

@ApiBearerAuth()
@Controller('call-states')
export class CallStateController {
  constructor(private readonly service: CallStateService) {}

  @Get()
  async getAll() {
    const response = await this.service.findAll();
    return response;
  }
}
