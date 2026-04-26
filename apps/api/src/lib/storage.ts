export interface StorageDriver {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

function getDriver(): StorageDriver {
  const driver = process.env['STORAGE_DRIVER'] ?? 'supabase';
  if (driver === 'supabase') return require('./storage/supabase').supabaseDriver;
  if (driver === 's3') return require('./storage/s3').s3Driver;
  return require('./storage/local').localDriver;
}

export const storage: StorageDriver = {
  upload: (...args) => getDriver().upload(...args),
  delete: (...args) => getDriver().delete(...args),
};
