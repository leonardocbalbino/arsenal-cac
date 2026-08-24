import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';

const ALLOWED_EXT = ['.png', '.jpg', '.jpeg', '.pdf', '.webp'];

export const uploadStorage = diskStorage({
  destination: process.env.UPLOADS_DIR ?? './uploads',
  filename: (_req, file, callback) => {
    const ext = extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${ext}`);
  },
});

export function fileFilter(_req: unknown, file: Express.Multer.File, callback: (error: Error | null, accept: boolean) => void) {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    callback(new BadRequestException('Tipo de arquivo não permitido'), false);
    return;
  }
  callback(null, true);
}
