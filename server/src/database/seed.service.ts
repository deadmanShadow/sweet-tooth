import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = this.config.get<string>('adminEmail');
    const adminPassword = this.config.get<string>('adminPassword');

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'Admin credentials not found in environment variables. Skipping admin seeding.',
      );
      return;
    }

    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase() },
    });

    if (existingAdmin) {
      this.logger.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await this.prisma.user.create({
      data: {
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        name: 'Administrator',
        role: UserRole.ADMIN,
      },
    });

    this.logger.log(`Admin created successfully with email: ${adminEmail}`);
  }
}
