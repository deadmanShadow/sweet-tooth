import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { Cake, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCakeDto } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';
import { unlink } from 'node:fs/promises';

@Injectable()
export class CakesService {
  constructor(private readonly prisma: PrismaService) {}

  private toCakeResponse(cake: Cake): Record<string, unknown> {
    return {
      id: cake.id,
      name: cake.name,
      description: cake.description,
      price: cake.price,
      image: cake.image,
      createdAt: cake.createdAt,
      updatedAt: cake.updatedAt,
    };
  }

  async listPublic() {
    const cakes = await this.prisma.cake.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return cakes.map((c) => this.toCakeResponse(c));
  }

  async getPublicById(id: string) {
    const cake = await this.prisma.cake.findUnique({
      where: { id },
    });
    if (!cake) throw new NotFoundException('Cake not found');
    return this.toCakeResponse(cake);
  }

  async createAdmin(params: CreateCakeDto, imagePath?: string) {
    const data: Prisma.CakeCreateInput = {
      name: params.name,
      description: params.description,
      price: params.price,
      image: imagePath ?? null,
    };

    const cake = await this.prisma.cake.create({ data });
    return this.toCakeResponse(cake);
  }

  async updateAdmin(id: string, params: UpdateCakeDto, imagePath?: string | null) {
    const existing = await this.prisma.cake.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cake not found');

    const data: Prisma.CakeUpdateInput = {};
    if (params.name !== undefined) data.name = params.name;
    if (params.description !== undefined) data.description = params.description;
    if (params.price !== undefined) data.price = params.price;
    if (imagePath !== undefined) data.image = imagePath;

    const updated = await this.prisma.cake.update({ where: { id }, data });
    return this.toCakeResponse(updated);
  }

  async deleteAdmin(id: string) {
    const existing = await this.prisma.cake.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Cake not found');

    if (existing.image) {
      unlink(`./uploads/${existing.image}`).catch(() => {});
    }

    await this.prisma.cake.delete({ where: { id } });
    return { deleted: true };
  }
}

