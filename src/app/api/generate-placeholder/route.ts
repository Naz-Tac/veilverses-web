import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

type PlaceholderKey = "bridal" | "quinceanera" | "prom-formal" | "evening" | "accessories";

const PROMPTS: Record<PlaceholderKey, string> = {
  bridal:
    "full-body fashion model in a white A-line bridal gown with lace sleeves, soft studio lighting, boutique editorial photography",
  quinceanera:
    "full-body fashion model wearing a dramatic pink quinceanera ballgown with beading, high-end studio portrait, clean backdrop",
  "prom-formal":
    "full-body fashion model in an emerald fitted prom evening dress, modern fashion campaign look, studio lighting",
  evening:
    "full-body fashion model in a black velvet black-tie evening gown, luxury editorial fashion shoot, neutral background",
  accessories:
    "fashion model styled with bridal accessories including tiara, veil, and statement jewelry, luxury studio editorial",
};

const INTER_IMAGE_DELAY_MS = 2000;
const RETRY_DELAY_MS = 5000;
const MAX_RETRIES_PER_IMAGE = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isReplicate429Error(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeStatus = (error as { status?: unknown }).status;
  if (maybeStatus === 429) {
    return true;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && /429|too many requests/i.test(message);
}

async function with429Retry<T>(task: () => Promise<T>, key: PlaceholderKey): Promise<T> {
  let attempt = 0;

  while (attempt <= MAX_RETRIES_PER_IMAGE) {
    try {
      return await task();
    } catch (error) {
      if (!isReplicate429Error(error) || attempt === MAX_RETRIES_PER_IMAGE) {
        throw error;
      }

      attempt += 1;
      console.warn(
        `[generate-placeholder] Replicate 429 for ${key}. Retry ${attempt}/${MAX_RETRIES_PER_IMAGE} in ${RETRY_DELAY_MS}ms.`,
      );
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(`Retry loop exhausted for ${key}`);
}

function getOutputUrl(output: unknown): string | null {
  const asHttpString = (value: unknown): string | null => {
    if (typeof value === "string" && value.startsWith("http")) {
      return value;
    }

    if (value && typeof value === "object") {
      const maybeUrlFn = (value as { url?: unknown }).url;
      if (typeof maybeUrlFn === "function") {
        try {
          const resolved = maybeUrlFn.call(value) as unknown;
          if (typeof resolved === "string" && resolved.startsWith("http")) {
            return resolved;
          }
        } catch {
          // Ignore and continue with other extraction strategies.
        }
      }

      const maybeUrl = (value as { url?: unknown }).url;
      if (typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
        return maybeUrl;
      }

      const asString = String(value);
      if (asString.startsWith("http")) {
        return asString;
      }
    }

    return null;
  };

  const direct = asHttpString(output);
  if (direct) {
    return direct;
  }

  if (Array.isArray(output)) {
    const first = output[0];
    const firstUrl = asHttpString(first);
    if (firstUrl) {
      return firstUrl;
    }
  }

  return null;
}

async function generateAndUpload(
  replicate: Replicate,
  supabase: SupabaseClient<Database>,
  key: PlaceholderKey,
  prompt: string,
) {
  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt,
      go_fast: true,
      num_outputs: 1,
      aspect_ratio: "2:3",
      output_format: "png",
      output_quality: 90,
      num_inference_steps: 4,
    },
  });

  const imageUrl = getOutputUrl(output);
  if (!imageUrl) {
    throw new Error(`No image URL returned for ${key}`);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch generated image for ${key}`);
  }

  const bytes = new Uint8Array(await imageResponse.arrayBuffer());
  const objectPath = `${key}.png`;
  const upload = await supabase.storage.from("placeholders").upload(objectPath, bytes, {
    contentType: "image/png",
    cacheControl: "31536000",
    upsert: true,
  });

  if (upload.error) {
    throw new Error(`Supabase upload failed for ${key}: ${upload.error.message}`);
  }

  const publicUrl = supabase.storage.from("placeholders").getPublicUrl(objectPath).data.publicUrl;

  return {
    key,
    objectPath,
    sourceUrl: imageUrl,
    publicUrl,
  };
}

export async function POST() {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "Missing REPLICATE_API_TOKEN" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient(true);
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Supabase service role is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 400 },
      );
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const bucketName = "placeholders";
    const buckets = await supabase.storage.listBuckets();
    if (buckets.error) {
      throw new Error(`Unable to list storage buckets: ${buckets.error.message}`);
    }

    const exists = buckets.data.some((bucket) => bucket.name === bucketName);
    if (!exists) {
      const created = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: "10MB",
      });
      if (created.error) {
        throw new Error(`Unable to create storage bucket '${bucketName}': ${created.error.message}`);
      }
    }

    const entries = Object.entries(PROMPTS) as Array<[PlaceholderKey, string]>;
    const results = [] as Array<{
      key: PlaceholderKey;
      objectPath: string;
      sourceUrl: string;
      publicUrl: string;
    }>;
    const skipped = [] as Array<{ key: PlaceholderKey; objectPath: string }>;

    const existingObjects = await supabase.storage.from(bucketName).list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });
    if (existingObjects.error) {
      throw new Error(
        `Unable to list existing objects in storage bucket '${bucketName}': ${existingObjects.error.message}`,
      );
    }

    const existingNames = new Set(
      existingObjects.data
        .map((item) => item.name)
        .filter((name): name is string => typeof name === "string" && name.length > 0),
    );

    let generatedCount = 0;

    for (const [key, prompt] of entries) {
      const objectPath = `${key}.png`;
      if (existingNames.has(objectPath)) {
        skipped.push({ key, objectPath });
        continue;
      }

      if (generatedCount > 0) {
        await sleep(INTER_IMAGE_DELAY_MS);
      }

      const generated = await with429Retry(
        () => generateAndUpload(replicate, supabase, key, prompt),
        key,
      );
      results.push(generated);
      generatedCount += 1;
    }

    return NextResponse.json({
      ok: true,
      bucket: "placeholders",
      generated: results,
      skipped,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
