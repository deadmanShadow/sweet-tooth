import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async getStats() {
    const [totalOrders, revenueData, totalUsers, totalCakes] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          where: {
            status: { in: [OrderStatus.CONFIRMED, OrderStatus.DELIVERED] },
          },
          _sum: { total: true },
        }),
        this.prisma.user.count({ where: { role: 'USER' } }),
        this.prisma.cake.count(),
      ]);

    // Monthly grouped revenue (only for confirmed/delivered)
    const revenueByMonth = await this.prisma.$queryRaw<
      { month: string; revenue: number }[]
    >`
      SELECT TO_CHAR("createdAt", 'Mon') as month, SUM(total)::float as revenue
      FROM "Order"
      WHERE status IN ('CONFIRMED', 'DELIVERED')
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
        totalRevenue: revenueData._sum.total || 0,
        totalUsers,
        totalCakes,
      },
      revenueByMonth,
      statusDistribution: statusDistribution.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    };
  }

  async create(userId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new NotFoundException('Order items cannot be empty');
    }

    const cakeIds = dto.items.map((item) => item.cakeId);
    const cakes = await this.prisma.cake.findMany({
      where: { id: { in: cakeIds } },
    });

    if (cakes.length !== new Set(cakeIds).size) {
      throw new NotFoundException('Some cakes were not found');
    }

    const cakeMap = new Map(cakes.map((c) => [c.id, c]));
    let total = 0;

    const orderItemsData = dto.items.map((item) => {
      const cake = cakeMap.get(item.cakeId)!;
      const itemTotal = cake.price * item.quantity;
      total += itemTotal;
      return {
        cakeId: item.cakeId,
        quantity: item.quantity,
        price: cake.price, // unit price at time of order
      };
    });

    // Use Prisma transaction to create order and items
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
    });

    // Optional: Generate WhatsApp message/link for the order
    const whatsappMessage = this.whatsappService.generateOrderMessage(order);
    const whatsappUrl = this.whatsappService.getWhatsAppLink(whatsappMessage);

    return {
      ...order,
      whatsappMessage,
      whatsappUrl,
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

  async findAllAdmin(query: QueryOrderDto) {
    const { status, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async resetOrders() {
    return this.prisma.$transaction(async (tx) => {
      // Delete all order items first to avoid foreign key constraints if not cascaded
      await tx.orderItem.deleteMany({});
      // Then delete all orders
      await tx.order.deleteMany({});
      return { message: 'All orders and revenue have been reset successfully' };
    });
  }
}
