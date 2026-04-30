import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    const nodeEnv = config.get<string>('nodeEnv', 'development');
    const databaseUrl = config.get<string>('databaseUrl');

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log:
        nodeEnv === 'development'
          ? ['query', 'warn', 'error']
          : ['warn', 'error'],
    });

    if (!databaseUrl) {
      this.logger.error(
        'DATABASE_URL is not defined in the environment variables',
      );
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
