import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Product, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCakeDto } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';
import { unlink } from 'node:fs/promises';

type CakeImage = {
  imagePath?: string | null;
  imageUrl?: string | null;
};

@Injectable()
export class CakesService {
  constructor(private readonly prisma: PrismaService) {}

  private toPriceCents(price: number) {
    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException('Invalid price');
    }
    return Math.round(price * 100);
  }

  private toCakeResponse(product: Product & CakeImage): Record<string, unknown> {
    // Keep API response stable and hide internal naming.
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      price: product.priceCents / 100,
      isAvailable: product.isActive,
      imageUrl: product.imageUrl ?? (product.imagePath ? `/uploads/${product.imagePath}` : null),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async listPublic() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.toCakeResponse(p as Product));
  }

  async getPublicById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
    });
    if (!product) throw new NotFoundException('Cake not found');
    return this.toCakeResponse(product as Product);
  }

  async createAdmin(params: CreateCakeDto, imagePath?: string) {
    const isActive = params.isAvailable ?? true;
    const data: Prisma.ProductCreateInput = {
      name: params.name,
      description: params.description,
      priceCents: this.toPriceCents(params.price),
      isActive,
      imagePath: imagePath ?? null,
    };

    const product = await this.prisma.product.create({ data });
    return this.toCakeResponse(product as Product);
  }

  async updateAdmin(id: string, params: UpdateCakeDto, imagePath?: string | null) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cake not found');

    const data: Prisma.ProductUpdateInput = {};
    if (params.name !== undefined) data.name = params.name;
    if (params.description !== undefined) data.description = params.description;
    if (params.price !== undefined) data.priceCents = this.toPriceCents(params.price);
    if (params.isAvailable !== undefined) data.isActive = params.isAvailable;
    if (imagePath !== undefined) data.imagePath = imagePath;

    const updated = await this.prisma.product.update({ where: { id }, data });
    return this.toCakeResponse(updated as Product);
  }

  async deleteAdmin(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cake not found');

    // Best-effort delete; don't block DB delete if filesystem fails.
    if (existing.imagePath) {
      unlink(`./uploads/${existing.imagePath}`).catch(() => {});
    }

    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }
}

