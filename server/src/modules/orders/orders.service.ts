import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderWithItemsAndUser, WhatsAppService } from './whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async getStats() {
    const [totalOrders, totalRevenue, totalUsers, totalCakes] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { total: true },
        }),
        this.prisma.user.count({ where: { role: 'USER' } }),
        this.prisma.cake.count(),
      ]);

    const ordersByMonth = await this.prisma.$queryRaw<
      { month: string; count: number }[]
    >`
      SELECT TO_CHAR("createdAt", 'Mon') as month, COUNT(*)::int as count
      FROM "Order"
      GROUP BY month
      ORDER BY MIN("createdAt")
    `;

    const statusDistribution = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalUsers,
        totalCakes,
      },
      ordersByMonth,
      statusDistribution: statusDistribution.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    };
  }

  async create(userId: string, dto: CreateOrderDto) {
    const cakeIds = dto.items.map((item) => item.cakeId);
    const cakes = await this.prisma.cake.findMany({
      where: { id: { in: cakeIds } },
    });

    if (cakes.length !== cakeIds.length) {
      throw new NotFoundException('Some cakes were not found');
    }

    const cakeMap = new Map(cakes.map((c) => [c.id, c]));
    let total = 0;

    const orderItemsData = dto.items.map((item) => {
      const cake = cakeMap.get(item.cakeId)!;
      const price = cake.price * item.quantity;
      total += price;
      return {
        cakeId: item.cakeId,
        quantity: item.quantity,
        price: cake.price,
      };
    });

    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          userId,
          total,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          user: true,
          items: {
            include: {
              cake: true,
            },
          },
        },
      });
    });

    const whatsappMessage = this.whatsappService.generateOrderMessage(
      order as unknown as OrderWithItemsAndUser,
    );
    const whatsappLink = this.whatsappService.getWhatsAppLink(whatsappMessage);

    return {
      order,
      whatsappMessage: decodeURIComponent(whatsappMessage),
      whatsappLink,
    };
  }

  async findAllForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            cake: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            cake: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            cake: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
