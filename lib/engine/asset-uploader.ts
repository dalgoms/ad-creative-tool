import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const ASSETS_DIR = join(process.cwd(), "public", "generated-assets");
const BUCKET = "creative-assets";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function useCloudStorage(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function saveAsset(
  png: Buffer,
  campaignId: string,
  fileName: string
): Promise<string> {
  if (useCloudStorage()) {
    return uploadToSupabase(png, campaignId, fileName);
  }
  return saveLocally(png, campaignId, fileName);
}

async function uploadToSupabase(
  png: Buffer,
  campaignId: string,
  fileName: string
): Promise<string> {
  const supabase = getSupabase()!;
  const storagePath = `${campaignId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, png, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function saveLocally(
  png: Buffer,
  campaignId: string,
  fileName: string
): Promise<string> {
  const dir = join(ASSETS_DIR, campaignId);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, fileName), png);
  return `/generated-assets/${campaignId}/${fileName}`;
}

// Re-export the old name for backward compatibility
export const saveAssetLocally = saveAsset;
