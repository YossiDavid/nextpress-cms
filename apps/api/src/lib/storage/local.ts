import { writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { StorageDriver } from '../storage.js';

export const localDriver: StorageDriver = {
  async upload(buffer, filename, _mimeType) {
    const uploadDir = process.env['UPLOAD_DIR'] ?? './uploads';
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    const baseUrl = process.env['UPLOAD_URL'] ?? 'http://localhost:3000/uploads';
    return `${baseUrl}/${filename}`;
  },
  async delete(url) {
    const uploadDir = process.env['UPLOAD_DIR'] ?? './uploads';
    try { await unlink(path.join(uploadDir, path.basename(url))); } catch {}
  },
};
