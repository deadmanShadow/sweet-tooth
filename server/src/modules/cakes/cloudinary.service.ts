import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  get v2() {
    return cloudinary;
  }

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      void cloudinary.uploader.destroy(publicId, (error: any, result: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error) return reject(new Error(String(error?.message || error)));
        resolve(result);
      });
    });
  }
}
