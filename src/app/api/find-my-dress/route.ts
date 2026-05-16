import { NextRequest, NextResponse } from "next/server";
import { getDressesForMatching } from "@/lib/supabase/queries";
import { DressMatch } from "@/types/domain";

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function scoreDress(dress: DressMatch, styleText: string): number {
  const styleTokens = new Set(tokenize(styleText));
  const dressTokens = tokenize(`${dress.name} ${dress.category} ${dress.color} ${dress.size} ${dress.sku}`);

  let score = 0;
  for (const token of dressTokens) {
    if (styleTokens.has(token)) {
      score += 3;
    }
  }

  const styleLower = styleText.toLowerCase();
  if (styleLower.includes(dress.category.toLowerCase())) {
    score += 6;
  }
  if (styleLower.includes(dress.color.toLowerCase())) {
    score += 4;
  }

  return score;
}

async function analyzeWithClaude(base64Image: string, mimeType: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 450,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: "Analyze this dress/outfit image for bridal boutique styling. Return concise style notes including silhouette, neckline, fabric feel, color palette, formality, and likely category among Bridal, Quinceanera, Prom & Formal, Evening.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error: ${text}`);
  }

  const payload = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const textBlock = payload.content?.find((item) => item.type === "text")?.text;
  if (!textBlock) {
    throw new Error("No analysis text returned from Anthropic.");
  }

  return textBlock;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const image = form.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const mimeType = image.type || "image/jpeg";
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const styleAnalysis = await analyzeWithClaude(base64, mimeType);
    const dresses = await getDressesForMatching();

    const matches = dresses
      .map((dress) => ({ ...dress, score: scoreDress(dress, styleAnalysis) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return NextResponse.json({
      styleAnalysis,
      matches,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
