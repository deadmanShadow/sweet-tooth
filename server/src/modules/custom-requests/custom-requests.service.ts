import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { WhatsAppService } from '../orders/whatsapp.service';
import { CreateCustomRequestDto } from './dto/create-custom-request.dto';
import { QueryCustomRequestDto } from './dto/query-custom-request.dto';

@Injectable()
export class CustomRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async create(dto: CreateCustomRequestDto) {
    const customRequest = await this.prisma.customRequest.create({
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerAddress: dto.customerAddress,
        location: dto.location,
        type: dto.type,
        flavor: dto.flavor,
        pounds: dto.pounds,
        size: dto.size,
        features: dto.features,
        description: dto.description,
        images: dto.images || [],
      },
    });

    const message =
      this.whatsappService.generateCustomRequestMessage(customRequest);
    const whatsappUrl = this.whatsappService.getWhatsAppLink(message);

    // Update with whatsappUrl for reference
    const updated = await this.prisma.customRequest.update({
      where: { id: customRequest.id },
      data: { whatsappUrl },
    });

    return updated;
  }

  async findAll(query: QueryCustomRequestDto) {
    const { status, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomRequestWhereInput = {};

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
      this.prisma.customRequest.count({ where }),
      this.prisma.customRequest.findMany({
        where,
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
    const request = await this.prisma.customRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Custom request not found');
    return request;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    price?: number,
    cost?: number,
  ) {
    const existing = await this.prisma.customRequest.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Custom request not found');

    const updateData: any = { status };
    if (price !== undefined) updateData.price = price;
    if (cost !== undefined) updateData.cost = cost;

    return this.prisma.customRequest.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.customRequest.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Custom request not found');

    return this.prisma.customRequest.delete({
      where: { id },
    });
  }
}
