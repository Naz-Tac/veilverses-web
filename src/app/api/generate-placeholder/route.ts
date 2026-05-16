import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

type PlaceholderKey = "bridal" | "quinceanera" | "prom-formal" | "evening" | "accessories";

const PROMPTS: Record<PlaceholderKey, string[]> = {
  bridal: [
    "full-body bride in A-line lace wedding gown, cathedral veil, soft golden studio lighting, editorial photography",
    "full-body bride in fitted mermaid wedding dress with pearls, luxury bridal portrait, clean backdrop",
    "full-body bride in princess ballgown with floral details, tiara, high-end wedding photography",
    "full-body bride in minimalist silk slip wedding dress, modern bridal editorial, soft lighting",
    "full-body bride in off-shoulder tulle wedding gown, romantic bridal shoot, boutique style",
    "full-body bride in vintage lace boho wedding dress, bohemian bridal editorial, natural lighting",
  ],
  quinceanera: [
    "full-body quinceañera in pink ballgown with rhinestones, tiara, glamorous studio portrait",
    "full-body quinceañera in royal blue layered tulle gown, elegantly styled, high-end photography",
    "full-body quinceañera in gold sequin ballgown with tiara, luxury editorial, formal lighting",
    "full-body quinceañera in lavender princess gown with flowers, celebratory bridal portrait",
    "full-body quinceañera in red ballgown with embroidery, dramatic formal wear, boutique style",
    "full-body quinceañera in emerald green tulle ballgown, elegant quinceañera editorial, studio",
  ],
  "prom-formal": [
    "full-body model in emerald green fitted prom dress with slit, elegant prom editorial, studio lighting",
    "full-body model in navy blue sequin prom gown, backless formal dress, luxury portrait",
    "full-body model in red satin prom dress with sweetheart neckline, glamorous formal wear",
    "full-body model in blush pink tulle prom ball gown, romantic prom editorial, high-end photography",
    "full-body model in black velvet prom dress with off-shoulder, elegant formal gown, studio",
    "full-body model in champagne beaded prom dress, floor length, luxury formal editorial",
  ],
  evening: [
    "full-body model in black velvet evening gown with halter neck, luxe evening wear, studio lighting",
    "full-body model in burgundy silk evening dress with draped details, elegant evening editorial",
    "full-body model in navy blue sequin evening gown, long formal dress, high-end photography",
    "full-body model in emerald satin evening dress with cowl neck, glamorous formal gown, portrait",
    "full-body model in gold metallic evening gown, floor length, luxury evening editorial, boutique",
    "full-body model in white crepe evening dress with minimalist design, elegant formal wear, studio",
  ],
  accessories: [
    "bridal tiara with diamonds and pearls on white silk background, flat lay luxury jewelry photography",
    "cathedral wedding veil with lace trim on white, flat lay bridal accessories, professional styling",
    "bridal jewelry set with gold earrings and necklace, luxury flat lay photography, white backdrop",
    "wedding shoes white satin heels with flowers, bridal accessories flat lay, elegant product photo",
    "bridal bouquet with white roses and peonies, luxury flower arrangement, on white background",
    "quinceañera crown with gold rhinestones and tiara, luxury flat lay accessories, professional",
  ],
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

async function with429Retry<T>(
  task: () => Promise<T>,
  identifier: string,
): Promise<T> {
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
        `[generate-placeholder] Replicate 429 for ${identifier}. Retry ${attempt}/${MAX_RETRIES_PER_IMAGE} in ${RETRY_DELAY_MS}ms.`,
      );
      await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(`Retry loop exhausted for ${identifier}`);
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
  imageIndex: number,
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
    throw new Error(`No image URL returned for ${key}-${imageIndex}`);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch generated image for ${key}-${imageIndex}`);
  }

  const bytes = new Uint8Array(await imageResponse.arrayBuffer());
  const objectPath = `${key}-${imageIndex}.png`;
  const upload = await supabase.storage.from("placeholders").upload(objectPath, bytes, {
    contentType: "image/png",
    cacheControl: "31536000",
    upsert: true,
  });

  if (upload.error) {
    throw new Error(`Supabase upload failed for ${key}-${imageIndex}: ${upload.error.message}`);
  }

  const publicUrl = supabase.storage.from("placeholders").getPublicUrl(objectPath).data.publicUrl;

  return {
    key,
    imageIndex,
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

    const results = [] as Array<{
      key: PlaceholderKey;
      imageIndex: number;
      objectPath: string;
      sourceUrl: string;
      publicUrl: string;
    }>;
    const skipped = [] as Array<{ key: PlaceholderKey; imageIndex: number; objectPath: string }>;

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

    for (const [key, prompts] of Object.entries(PROMPTS) as Array<
      [PlaceholderKey, string[]]
    >) {
      for (let i = 0; i < prompts.length; i += 1) {
        const imageIndex = i + 1;
        const objectPath = `${key}-${imageIndex}.png`;

        if (existingNames.has(objectPath)) {
          skipped.push({ key, imageIndex, objectPath });
          continue;
        }

        if (generatedCount > 0) {
          await sleep(INTER_IMAGE_DELAY_MS);
        }

        const generated = await with429Retry(
          () => generateAndUpload(replicate, supabase, key, prompts[i], imageIndex),
          `${key}-${imageIndex}`,
        );
        results.push(generated);
        generatedCount += 1;
      }
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
