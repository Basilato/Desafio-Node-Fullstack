import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check da API' })
  @ApiOkResponse({ schema: { example: { status: 'ok', timestamp: '2025-01-01T00:00:00.000Z' } } })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' };
  }
}
