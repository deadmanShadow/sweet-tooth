import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { CloudinaryService } from './cloudinary.service';
import { cakeCloudinaryStorage } from './multer-storage';

@Injectable()
export class CakeImageInterceptor implements NestInterceptor {
  private interceptor: NestInterceptor;

  constructor(private readonly cloudinaryService: CloudinaryService) {
    const storage = cakeCloudinaryStorage(this.cloudinaryService);
    this.interceptor = new (FileInterceptor('image', { storage }))();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return this.interceptor.intercept(context, next);
  }
}
