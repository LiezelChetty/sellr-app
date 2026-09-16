import { AIAnalysis } from "../types/domain";

export interface ItemAnalysisService {
  analyse(photoUris: string[]): Promise<AIAnalysis>;
}
export class MockItemAnalysisService implements ItemAnalysisService {
  async analyse(photoUris: string[]): Promise<AIAnalysis> {
    if (!photoUris.length) throw new Error("Add at least one photo first.");
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      title: "Nike Air Max 270",
      brand: "Nike",
      category: "Fashion",
      subcategory: "Trainers",
      size: "EU 39",
      condition: "Good condition",
      colour: "Black / white",
      description:
        "Pre-owned Nike Air Max 270 trainers in good condition. Please review the photos for signs of wear.",
      suggestedPriceLow: 35,
      suggestedPriceHigh: 48,
      recommendedPrice: 44,
      confidence: 0.78,
    };
  }
}
export const itemAnalysisService: ItemAnalysisService =
  new MockItemAnalysisService();
