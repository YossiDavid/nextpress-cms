import type { StorageDriver } from '../storage.js';

export const s3Driver: StorageDriver = {
  async upload(buffer, filename, mimeType) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = buildClient(S3Client);
    const bucket = requireEnv('S3_BUCKET');
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: filename, Body: buffer, ContentType: mimeType }));
    return buildPublicUrl(filename, bucket);
  },
  async delete(url) {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const client = buildClient(S3Client);
    const bucket = requireEnv('S3_BUCKET');
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: url.split('/').pop() ?? url }));
  },
};

function buildClient(S3Client: any) {
  const cfg: any = { region: process.env['S3_REGION'] ?? 'us-east-1', credentials: { accessKeyId: requireEnv('S3_ACCESS_KEY_ID'), secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY') } };
  if (process.env['S3_ENDPOINT']) { cfg.endpoint = process.env['S3_ENDPOINT']; cfg.forcePathStyle = true; }
  return new S3Client(cfg);
}

function buildPublicUrl(filename: string, bucket: string) {
  if (process.env['S3_PUBLIC_URL']) return `${process.env['S3_PUBLIC_URL'].replace(/\/$/, '')}/${filename}`;
  return `https://${bucket}.s3.${process.env['S3_REGION'] ?? 'us-east-1'}.amazonaws.com/${filename}`;
}

function requireEnv(key: string) {
  const v = process.env[key]; if (!v) throw new Error(`Missing env var: ${key}`); return v;
}
