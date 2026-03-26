import { Module } from '@nestjs/common';
import { CakesController } from './cakes.controller';
import { CakesService } from './cakes.service';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from './cloudinary.service';
import { CakeImageInterceptor } from './cake-image.interceptor';

@Module({
  imports: [AuthModule],
  controllers: [CakesController],
  providers: [CakesService, CloudinaryService, CakeImageInterceptor],
  exports: [CloudinaryService],
})
export class CakesModule {}
