import { Module } from '@nestjs/common';
import { CakesController } from './cakes.controller';
import { CakesService } from './cakes.service';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [AuthModule],
  controllers: [CakesController],
  providers: [CakesService, CloudinaryService],
  exports: [CloudinaryService],
})
export class CakesModule {}
