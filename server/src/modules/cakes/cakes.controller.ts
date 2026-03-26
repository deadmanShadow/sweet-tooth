import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import type { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateCakeDto } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';
import { CakesService } from './cakes.service';
import { cakeMulterStorage, imagePathFromFilename } from './multer-storage';

@Controller('cakes')
export class CakesController {
  constructor(private readonly cakes: CakesService) {}

  @Get()
  listPublic() {
    return this.cakes.listPublic();
  }

  @Get(':id')
  getPublic(@Param('id') id: string) {
    return this.cakes.getPublicById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: cakeMulterStorage(),
      limits: { fileSize: 5_000_000 },
    }),
  )
  createAdmin(
    @Body() dto: CreateCakeDto,
    @UploadedFile() image?: Multer.File,
  ) {
    const imagePath = image ? imagePathFromFilename(image.filename) : undefined;
    return this.cakes.createAdmin(dto, imagePath);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: cakeMulterStorage(),
      limits: { fileSize: 5_000_000 },
    }),
  )
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateCakeDto,
    @UploadedFile() image?: Multer.File,
  ) {
    const imagePath = image ? imagePathFromFilename(image.filename) : undefined;
    return this.cakes.updateAdmin(id, dto, imagePath);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteAdmin(@Param('id') id: string) {
    return this.cakes.deleteAdmin(id);
  }
}

