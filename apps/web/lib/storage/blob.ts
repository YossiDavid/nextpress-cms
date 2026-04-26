import type { StorageDriver } from './index';

// Requires: pnpm add @vercel/blob
// Env vars: BLOB_READ_WRITE_TOKEN (auto-provisioned by Vercel Marketplace)

export const blobDriver: StorageDriver = {
  async upload(buffer, filename, mimeType) {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimeType,
    });
    return blob.url;
  },

  async delete(url) {
    const { del } = await import('@vercel/blob');
    await del(url);
  },
};
