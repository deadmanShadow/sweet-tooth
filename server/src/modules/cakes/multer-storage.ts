import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CloudinaryService } from './cloudinary.service';

export function cakeCloudinaryStorage(cloudinaryService: CloudinaryService) {
  return new CloudinaryStorage({
    cloudinary: cloudinaryService.v2,
    params: {
      folder: 'sweet-tooth/cakes',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    } as Record<string, any>,
  });
}
