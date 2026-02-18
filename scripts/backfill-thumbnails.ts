/**
 * One-time script to generate WebP thumbnails for existing infographics.
 * Run with: bun scripts/backfill-thumbnails.ts
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data: posts, error } = await supabase
  .from("posts")
  .select("id")
  .eq("image_status", "ready")
  .not("image_url", "is", null);

if (error || !posts) {
  console.error("Failed to fetch posts:", error);
  process.exit(1);
}

console.log(`Found ${posts.length} posts with infographics.`);

let ok = 0;
let skipped = 0;
let failed = 0;

for (const post of posts) {
  const thumbPath = `${post.id}_thumb.webp`;

  // Check if thumbnail already exists
  const { data: existing } = await supabase.storage
    .from("infographics")
    .download(thumbPath);
  if (existing && existing.size > 0) {
    skipped++;
    console.log(`[skip] ${post.id} — thumbnail already exists`);
    continue;
  }

  // Download full-res PNG
  const { data: blob, error: dlErr } = await supabase.storage
    .from("infographics")
    .download(`${post.id}.png`);

  if (dlErr || !blob) {
    failed++;
    console.error(`[fail] ${post.id} — download error:`, dlErr);
    continue;
  }

  try {
    const buffer = Buffer.from(await blob.arrayBuffer());
    const thumbBuffer = await sharp(buffer)
      .resize(512, null, { kernel: "nearest" })
      .webp({ lossless: true })
      .toBuffer();

    const { error: upErr } = await supabase.storage
      .from("infographics")
      .upload(thumbPath, thumbBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (upErr) throw upErr;

    const sizePct = ((thumbBuffer.length / buffer.length) * 100).toFixed(1);
    ok++;
    console.log(
      `[ok]   ${post.id} — ${buffer.length} → ${thumbBuffer.length} bytes (${sizePct}%)`
    );
  } catch (err) {
    failed++;
    console.error(`[fail] ${post.id} — processing error:`, err);
  }
}

console.log(`\nDone: ${ok} created, ${skipped} skipped, ${failed} failed.`);
