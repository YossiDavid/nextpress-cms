import { writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { StorageDriver } from './index';

export const localDriver: StorageDriver = {
  async upload(buffer, filename, _mimeType) {
    const uploadDir = process.env['UPLOAD_DIR'] ?? './uploads';
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    const baseUrl = process.env['UPLOAD_URL'] ?? 'http://localhost:3000/uploads';
    return `${baseUrl}/${filename}`;
  },

  async delete(url) {
    const uploadDir = process.env['UPLOAD_DIR'] ?? './uploads';
    const filename = path.basename(url);
    try {
      await unlink(path.join(uploadDir, filename));
    } catch {
      // File may already be gone
    }
  },
};
