import type { StorageDriver } from './index';

// Requires: pnpm add @aws-sdk/client-s3
// Works with AWS S3, Cloudflare R2, MinIO, and any S3-compatible storage
//
// Env vars:
//   S3_BUCKET           — bucket name
//   S3_REGION           — e.g. us-east-1 (use 'auto' for Cloudflare R2)
//   S3_ACCESS_KEY_ID    — access key
//   S3_SECRET_ACCESS_KEY — secret key
//   S3_ENDPOINT         — custom endpoint URL (required for R2/MinIO, omit for AWS)
//   S3_PUBLIC_URL       — base URL for public file access
//                         e.g. https://pub-xxx.r2.dev  or  https://s3.amazonaws.com/my-bucket
//                         If omitted, falls back to https://{bucket}.s3.{region}.amazonaws.com

export const s3Driver: StorageDriver = {
  async upload(buffer, filename, mimeType) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const client = buildClient();
    const bucket = requireEnv('S3_BUCKET');

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
      }),
    );

    return buildPublicUrl(filename, bucket);
  },

  async delete(url) {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const client = buildClient();
    const bucket = requireEnv('S3_BUCKET');
    const key = url.split('/').pop() ?? url;

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  },
};

function buildClient() {
  const { S3Client } = require('@aws-sdk/client-s3');
  const config: Record<string, unknown> = {
    region: process.env['S3_REGION'] ?? 'us-east-1',
    credentials: {
      accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
    },
  };
  if (process.env['S3_ENDPOINT']) {
    config['endpoint'] = process.env['S3_ENDPOINT'];
    config['forcePathStyle'] = true; // required for MinIO
  }
  return new S3Client(config);
}

function buildPublicUrl(filename: string, bucket: string): string {
  if (process.env['S3_PUBLIC_URL']) {
    return `${process.env['S3_PUBLIC_URL'].replace(/\/$/, '')}/${filename}`;
  }
  const region = process.env['S3_REGION'] ?? 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
}

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}
