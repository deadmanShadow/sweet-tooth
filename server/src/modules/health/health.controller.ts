import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHealth() {
    return { status: 'ok' as const, timestamp: new Date().toISOString() };
  }

  @Get('db')
  async getDbHealth() {
    // Simple connection check
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' as const, db: 'connected' as const };
  }
}
