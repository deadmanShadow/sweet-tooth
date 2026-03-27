import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CakeImageInterceptor } from './cake-image.interceptor';
import { CakesService } from './cakes.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateCakeDto } from './dto/create-cake.dto';
import { UpdateCakeDto } from './dto/update-cake.dto';

@Controller('cakes')
export class CakesController {
  constructor(
    private readonly cakes: CakesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {}

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
  @UseInterceptors(CakeImageInterceptor)
  createAdmin(
    @Body() dto: CreateCakeDto,
    @UploadedFile() image?: { path: string },
  ) {
    const imagePath = image?.path;
    return this.cakes.createAdmin(dto, imagePath);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(CakeImageInterceptor)
  updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateCakeDto,
    @UploadedFile() image?: { path: string },
  ) {
    const imagePath = image?.path;
    return this.cakes.updateAdmin(id, dto, imagePath);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  deleteAdmin(@Param('id') id: string) {
    return this.cakes.deleteAdmin(id);
  }
}
