import { AIAnalysis } from "../types/domain";

export interface ItemAnalysisService {
  analyse(photoUris: string[]): Promise<AIAnalysis>;
}
export class MockItemAnalysisService implements ItemAnalysisService {
  async analyse(photoUris: string[]): Promise<AIAnalysis> {
    if (!photoUris.length) throw new Error("Add at least one photo first.");
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {
      title: "Coffee machine",
      brand: "",
      category: "Home",
      subcategory: "Kitchen appliances",
      condition: "Good",
      description:
        "Coffee machine in good used condition. Clean and ready for a new home. Please check the original photos for condition.",
      suggestedPrice: 25,
      priceConfidence: 0.72,
      tags: ["coffee", "kitchen", "appliance"],
    };
  }
}
export const itemAnalysisService: ItemAnalysisService =
  new MockItemAnalysisService();
