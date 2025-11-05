import { Public } from '@common/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return true;
  }
}
