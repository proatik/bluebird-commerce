import { Get, Controller } from '@nestjs/common';

import { HealthService } from '@/health/health.service';

import type { HealthStatus } from '@/health/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthStatus> {
    return await this.healthService.check();
  }
}
