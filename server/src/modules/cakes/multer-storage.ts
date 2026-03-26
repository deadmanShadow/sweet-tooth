import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';

export const CAKE_UPLOAD_DIR = 'uploads/cakes';

export function ensureCakeUploadDir() {
  if (!existsSync(CAKE_UPLOAD_DIR)) {
    mkdirSync(CAKE_UPLOAD_DIR, { recursive: true });
  }
}

export function cakeMulterStorage() {
  ensureCakeUploadDir();
  return diskStorage({
    destination: (_req, _file, cb) => cb(null, CAKE_UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname) || '';
      const filename = `${randomUUID()}${ext.toLowerCase()}`;
      cb(null, filename);
    },
  });
}

export function imagePathFromFilename(filename: string) {
  // Stored value is relative path under /uploads.
  return join('cakes', filename).replace(/\\/g, '/');
}

