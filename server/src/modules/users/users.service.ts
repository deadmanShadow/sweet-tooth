import { Injectable } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  async create(params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: UserRole;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: params.email,
        password: params.password,
        name: params.name,
        phone: params.phone,
        role: params.role ?? UserRole.USER,
      },
    });
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ) {
    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 12);
    }
    const user = await this.prisma.user.update({ where, data });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;
      return rest;
    });
  }

  async delete(id: string) {
    // Manually delete associated orders and their items to satisfy foreign key constraint
    await this.prisma.orderItem.deleteMany({
      where: { order: { userId: id } },
    });
    await this.prisma.order.deleteMany({
      where: { userId: id },
    });

    return this.prisma.user.delete({ where: { id } });
  }
}
