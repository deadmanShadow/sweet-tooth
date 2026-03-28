import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OrderStatus, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CloudinaryService } from '../cakes/cloudinary.service';
import { CustomRequestsService } from './custom-requests.service';
import { CreateCustomRequestDto } from './dto/create-custom-request.dto';
import { QueryCustomRequestDto } from './dto/query-custom-request.dto';

@Controller('custom-requests')
export class CustomRequestsController {
  constructor(
    private readonly customRequestsService: CustomRequestsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5)) // Support up to 5 images
  async create(
    @Body() dto: CreateCustomRequestDto,
    @UploadedFiles() files: any[],
  ) {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = this.cloudinaryService.v2.uploader.upload_stream(
            {
              folder: 'sweet-tooth/custom-requests',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result?.secure_url || '');
            },
          );
          uploadStream.end(file.buffer);
        });
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    return this.customRequestsService.create({
      ...dto,
      images: imageUrls,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: QueryCustomRequestDto) {
    return this.customRequestsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.customRequestsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Body('price') price?: number,
    @Body('cost') cost?: number,
  ) {
    return this.customRequestsService.updateStatus(id, status, price, cost);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.customRequestsService.remove(id);
  }
}
