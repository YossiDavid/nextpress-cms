import type { StorageDriver } from '../storage.js';

// Requires: pnpm add @supabase/supabase-js
// Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET (default: media)

export const supabaseDriver: StorageDriver = {
  async upload(buffer, filename, mimeType) {
    const { createClient } = await import('@supabase/supabase-js');
    const client = buildClient(createClient);
    const bucket = process.env['SUPABASE_STORAGE_BUCKET'] ?? 'media';

    const { error } = await client.storage
      .from(bucket)
      .upload(filename, buffer, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = client.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  },

  async delete(url) {
    const { createClient } = await import('@supabase/supabase-js');
    const client = buildClient(createClient);
    const bucket = process.env['SUPABASE_STORAGE_BUCKET'] ?? 'media';
    const filename = url.split('/').pop() ?? url;
    await client.storage.from(bucket).remove([filename]);
  },
};

function buildClient(createClient: Function) {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key);
}
