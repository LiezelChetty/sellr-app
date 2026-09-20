import { encode } from "base64-arraybuffer";
import { supabase } from "../lib/supabase";
import { AIAnalysis } from "../types/domain";

const SUPPORTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const mimeFromUri = (uri: string, header: string | null) => {
  const normalized = header?.split(";")[0];
  if (normalized && SUPPORTED_MIME.has(normalized)) return normalized;
  const extension = uri.split("?")[0].split(".").pop()?.toLowerCase();
  return extension === "png"
    ? "image/png"
    : extension === "webp"
      ? "image/webp"
      : extension === "jpg" || extension === "jpeg"
        ? "image/jpeg"
        : null;
};

export interface ItemAnalysisService {
  analyse(
    photoUris: string[],
    options: { demoMode: boolean },
  ): Promise<AIAnalysis>;
}

class OfferMeItemAnalysisService implements ItemAnalysisService {
  async analyse(
    photoUris: string[],
    { demoMode }: { demoMode: boolean },
  ): Promise<AIAnalysis> {
    if (!photoUris.length) throw new Error("Add at least one photo first.");
    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        title: "Item for sale",
        brand: "",
        category: "Other",
        subcategory: "",
        condition: "Good",
        description:
          "Add a short, accurate description of the item and its visible condition. Please check the original photos for condition.",
        suggestedPrice: 0,
        priceConfidence: 0,
        tags: [],
        warnings: [
          "Development mode does not analyse photographs. Enter and check the details yourself.",
        ],
        analysisSource: "development",
      };
    }
    if (!supabase)
      throw new Error(
        "Automatic listing suggestions are unavailable. Enter the details manually.",
      );
    const images = await Promise.all(
      photoUris.slice(0, 6).map(async (uri) => {
        const response = await fetch(uri);
        if (!response.ok)
          throw new Error("One of the selected photos could not be read.");
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength > 6 * 1024 * 1024)
          throw new Error("Each analysis photo must be 6 MB or smaller.");
        const mimeType = mimeFromUri(uri, response.headers.get("content-type"));
        if (!mimeType)
          throw new Error(
            "Automatic analysis supports JPEG, PNG and WebP photos. You can still enter the listing manually.",
          );
        return {
          mimeType,
          dataUrl: `data:${mimeType};base64,${encode(bytes)}`,
        };
      }),
    );
    const { data, error } = await supabase.functions.invoke("analyze-listing", {
      body: { images },
    });
    if (error) {
      let message =
        "We couldn’t prepare this listing automatically. You can enter the details yourself.";
      try {
        message =
          (
            await (
              error as { context?: { json(): Promise<{ error?: string }> } }
            ).context?.json()
          )?.error ?? message;
      } catch {
        /* keep safe message */
      }
      throw new Error(message);
    }
    if (!data?.analysis)
      throw new Error(
        "We couldn’t prepare this listing automatically. You can enter the details yourself.",
      );
    const result = data.analysis as {
      title: string;
      category: string;
      condition: string;
      description: string;
      suggestedPrice: number | null;
      brand: string | null;
      confidence: number;
      warnings: string[];
    };
    return {
      title: result.title,
      brand: result.brand ?? "",
      category: result.category,
      subcategory: "",
      condition: result.condition,
      description: result.description,
      suggestedPrice: result.suggestedPrice ?? 0,
      priceConfidence: result.confidence,
      tags: [],
      warnings: [
        ...(result.warnings ?? []),
        ...(photoUris.length > 6
          ? [
              "The first six photos were used for automatic analysis; all original photos remain on the listing.",
            ]
          : []),
      ],
      analysisSource: "vision",
    };
  }
}

export const itemAnalysisService: ItemAnalysisService =
  new OfferMeItemAnalysisService();
