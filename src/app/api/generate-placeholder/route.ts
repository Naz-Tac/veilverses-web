import { NextResponse } from "next/server";
import Replicate from "replicate";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

type PlaceholderKey = "bridal" | "quinceanera" | "prom" | "evening" | "accessories";

const PROMPTS: Record<PlaceholderKey, string> = {
  bridal:
    "elegant bride wearing a white A-line wedding gown with lace details, studio photography, luxury boutique, white background",
  quinceanera:
    "young woman in a pink ballgown quinceanera dress with rhinestones, studio photo",
  prom: "teenage girl in emerald green fitted prom dress, professional photography",
  evening: "woman in black velvet evening gown, luxury fashion editorial",
  accessories: "luxury bridal accessories, tiara veil jewelry flat lay, gold and white",
};

function getOutputUrl(output: unknown): string | null {
  if (typeof output === "string" && output.startsWith("http")) {
    return output;
  }

  if (Array.isArray(output)) {
    const first = output[0];
    if (typeof first === "string" && first.startsWith("http")) {
      return first;
    }
    if (first && typeof first === "object" && "url" in first) {
      const url = (first as { url?: unknown }).url;
      if (typeof url === "string" && url.startsWith("http")) {
        return url;
      }
    }
  }

  if (output && typeof output === "object" && "url" in output) {
    const url = (output as { url?: unknown }).url;
    if (typeof url === "string" && url.startsWith("http")) {
      return url;
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

    for (const [key, prompt] of entries) {
      const generated = await generateAndUpload(replicate, supabase, key, prompt);
      results.push(generated);
    }

    return NextResponse.json({
      ok: true,
      bucket: "placeholders",
      generated: results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
