import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const CATEGORIES = [
  "Home",
  "Kids",
  "Fashion",
  "Electronics",
  "Garden",
  "Sports",
  "Other",
] as const;
const CONDITIONS = ["New", "Like new", "Good", "Fair", "For parts"] as const;
const CURRENCIES: Record<string, string> = {
  IE: "EUR",
  GB: "GBP",
  ZA: "ZAR",
  US: "USD",
  AU: "AUD",
};
const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};
type Analysis = {
  title: string;
  category: (typeof CATEGORIES)[number];
  condition: (typeof CONDITIONS)[number];
  description: string;
  suggestedPrice: number | null;
  currency: string;
  brand: string | null;
  confidence: number;
  warnings: string[];
};

type ProviderError = {
  error?: {
    type?: unknown;
    code?: unknown;
    message?: unknown;
  };
};

const safeLogValue = (value: unknown, fallback: string) => {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return value
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted-key]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted-token]")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, 300);
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function validateImages(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 6)
    throw new Error("Choose between 1 and 6 supported photos.");
  let total = 0;
  const images = value.map((item) => {
    if (!item || typeof item !== "object")
      throw new Error("Invalid image payload.");
    const { dataUrl, mimeType } = item as Record<string, unknown>;
    if (
      typeof dataUrl !== "string" ||
      typeof mimeType !== "string" ||
      !ACCEPTED_MIME.has(mimeType)
    )
      throw new Error("Use JPEG, PNG or WebP photos.");
    const prefix = `data:${mimeType};base64,`;
    if (!dataUrl.startsWith(prefix)) throw new Error("Invalid image encoding.");
    const base64 = dataUrl.slice(prefix.length);
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))
      throw new Error("Invalid image encoding.");
    const bytes = Math.floor(base64.length * 0.75);
    if (bytes > 6 * 1024 * 1024)
      throw new Error("Each analysis photo must be 6 MB or smaller.");
    total += bytes;
    return { dataUrl, mimeType };
  });
  if (total > 20 * 1024 * 1024)
    throw new Error("The selected analysis photos are too large together.");
  return images;
}

function sanitize(value: unknown, currency: string): Analysis {
  if (!value || typeof value !== "object")
    throw new Error("Invalid structured response.");
  const raw = value as Record<string, unknown>;
  const title =
    typeof raw.title === "string" ? raw.title.trim().slice(0, 90) : "";
  const description =
    typeof raw.description === "string"
      ? raw.description.trim().slice(0, 700)
      : "";
  const category = CATEGORIES.includes(raw.category as never)
    ? (raw.category as Analysis["category"])
    : null;
  const condition = CONDITIONS.includes(raw.condition as never)
    ? (raw.condition as Analysis["condition"])
    : null;
  const confidence =
    typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
      ? Math.max(0, Math.min(1, raw.confidence))
      : 0;
  const suggestedPrice =
    typeof raw.suggestedPrice === "number" &&
    Number.isFinite(raw.suggestedPrice) &&
    raw.suggestedPrice > 0 &&
    raw.suggestedPrice <= 100000
      ? Math.round(raw.suggestedPrice * 100) / 100
      : null;
  const brand =
    typeof raw.brand === "string" && raw.brand.trim()
      ? raw.brand.trim().slice(0, 80)
      : null;
  const warnings = Array.isArray(raw.warnings)
    ? raw.warnings
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim().slice(0, 180))
        .filter(Boolean)
        .slice(0, 5)
    : [];
  if (!title || !description || !category || !condition)
    throw new Error("Incomplete structured response.");
  return {
    title,
    category,
    condition,
    description,
    suggestedPrice,
    currency,
    brand,
    confidence,
    warnings,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer "))
      return json({ error: "Authentication required." }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey)
      return json({ error: "Service configuration unavailable." }, 503);
    const db = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await db.auth.getUser(
      authorization.slice(7),
    );
    if (userError || !userData.user)
      return json({ error: "Authentication required." }, 401);
    const body = await req.json();
    const images = validateImages(body?.images);
    const { data: prefs, error: prefsError } = await db
      .from("user_preferences")
      .select("country_code")
      .eq("user_id", userData.user.id)
      .single();
    if (prefsError || !prefs)
      return json(
        {
          error:
            "Complete your OfferMe profile before using listing suggestions.",
        },
        400,
      );
    const currency = CURRENCIES[prefs.country_code];
    if (!currency)
      return json({ error: "Unsupported marketplace currency." }, 400);
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey)
      return json(
        {
          error:
            "Automatic listing suggestions are not configured yet. Enter the details manually.",
        },
        503,
      );
    const { data: claimed, error: quotaError } = await db.rpc(
      "claim_ai_analysis_request",
      { p_image_count: images.length },
    );
    if (quotaError) throw quotaError;
    if (!claimed)
      return json(
        {
          error:
            "You’ve reached the hourly listing-analysis limit. Enter the details manually or try again later.",
        },
        429,
      );
    const model = Deno.env.get("OPENAI_VISION_MODEL") || "gpt-4o-mini";
    console.info(
      JSON.stringify({
        event: "listing_analysis_provider_request",
        provider: "openai",
        model,
        api_key_configured: true,
        image_count: images.length,
      }),
    );
    const content = [
      {
        type: "input_text",
        text: `Analyse these as different views of the SAME second-hand marketplace item. Be conservative. Never infer a brand, model, authenticity, exact capacity, material, working status or hidden specification unless visibly supported. Describe only visible evidence. Photos cannot prove electrical or mechanical functionality. Use one allowed category and condition. suggestedPrice is a cautious AI estimate in ${currency}, not live comparable-sales data; use null when evidence is insufficient. Prefer a generic accurate title when uncertain. Keep the description concise and non-salesy and recommend checking photos for condition. Put uncertainty, conflicting views, visible damage and unverified functionality in warnings.`,
      },
      ...images.map((image) => ({
        type: "input_image",
        image_url: image.dataUrl,
        detail: "high",
      })),
    ];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    let providerResponse: Response;
    try {
      providerResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          store: false,
          input: [{ role: "user", content }],
          max_output_tokens: 900,
          text: {
            format: {
              type: "json_schema",
              name: "offerme_listing_analysis",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  category: { type: "string", enum: [...CATEGORIES] },
                  condition: { type: "string", enum: [...CONDITIONS] },
                  description: { type: "string" },
                  suggestedPrice: {
                    anyOf: [{ type: "number" }, { type: "null" }],
                  },
                  currency: { type: "string", enum: [currency] },
                  brand: { anyOf: [{ type: "string" }, { type: "null" }] },
                  confidence: { type: "number" },
                  warnings: { type: "array", items: { type: "string" } },
                },
                required: [
                  "title",
                  "category",
                  "condition",
                  "description",
                  "suggestedPrice",
                  "currency",
                  "brand",
                  "confidence",
                  "warnings",
                ],
              },
            },
          },
        }),
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!providerResponse.ok) {
      let providerError: ProviderError = {};
      try {
        providerError = (await providerResponse.json()) as ProviderError;
      } catch {
        // Keep diagnostics useful even when an upstream proxy returns non-JSON.
      }
      const safeProviderError = {
        event: "listing_analysis_provider_error",
        provider: "openai",
        model,
        status: providerResponse.status,
        request_id:
          providerResponse.headers.get("x-request-id") ?? "unavailable",
        error_type: safeLogValue(providerError.error?.type, "unknown"),
        error_code: safeLogValue(providerError.error?.code, "unknown"),
        error_message: safeLogValue(
          providerError.error?.message,
          "Provider returned no JSON error message.",
        ),
      };
      console.error(JSON.stringify(safeProviderError));
      return json(
        {
          error:
            "We couldn’t prepare this listing automatically. Enter the details manually.",
        },
        502,
      );
    }
    const provider = await providerResponse.json();
    const outputText =
      provider.output_text ??
      provider.output
        ?.flatMap(
          (item: { content?: Array<{ type?: string; text?: string }> }) =>
            item.content ?? [],
        )
        .find((item: { type?: string }) => item.type === "output_text")?.text;
    if (typeof outputText !== "string")
      throw new Error("Provider returned no structured output.");
    const analysis = sanitize(JSON.parse(outputText), currency);
    console.info(
      JSON.stringify({
        event: "listing_analysis_provider_success",
        provider: "openai",
        model: safeLogValue(provider.model, model),
        request_id:
          providerResponse.headers.get("x-request-id") ?? "unavailable",
      }),
    );
    return json({ analysis });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      return json(
        {
          error:
            "Listing analysis timed out. Enter the details manually or try again.",
        },
        504,
      );
    console.error(
      "Listing analysis failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return json(
      {
        error:
          "We couldn’t prepare this listing automatically. Enter the details manually.",
      },
      500,
    );
  }
});
