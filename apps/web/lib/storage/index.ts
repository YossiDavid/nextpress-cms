export interface StorageDriver {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>; // returns public URL
  delete(url: string): Promise<void>;
}

function getDriver(): StorageDriver {
  const driver = process.env['STORAGE_DRIVER'] ?? 'supabase';
  if (driver === 'supabase') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./supabase').supabaseDriver;
  }
  if (driver === 'blob') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./blob').blobDriver;
  }
  if (driver === 's3') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./s3').s3Driver;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./local').localDriver;
}

export const storage: StorageDriver = {
  upload: (...args) => getDriver().upload(...args),
  delete: (...args) => getDriver().delete(...args),
};
