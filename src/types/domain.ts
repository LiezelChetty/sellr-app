export type CountryCode = "IE" | "GB" | "ZA" | "US" | "AU";
export type MarketplaceCapability =
  | "PREPARE_ONLY"
  | "HANDOFF"
  | "OAUTH_AVAILABLE"
  | "DIRECT_PUBLISH"
  | "SYNC"
  | "DELIST";
export type MarketplaceConnectionStatus =
  | "NOT_SETUP"
  | "MOCK_CONNECTED"
  | "AVAILABLE"
  | "UNAVAILABLE";
export type ListingStatus = "DRAFT" | "READY" | "LIVE" | "SOLD";

export interface Marketplace {
  id: string;
  name: string;
  summary: string;
  capabilities: MarketplaceCapability[];
  handoffUrl?: string;
}
export interface MarketplaceRegion {
  countryCode: CountryCode;
  marketplaceIds: string[];
  currency: string;
  symbol: string;
}
export interface MarketplaceConnection {
  marketplaceId: string;
  status: MarketplaceConnectionStatus;
  isMock: boolean;
}
export interface AIAnalysis {
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  size: string;
  condition: string;
  colour: string;
  description: string;
  suggestedPriceLow: number;
  suggestedPriceHigh: number;
  recommendedPrice: number;
  confidence: number;
}
export interface MarketplaceListing {
  id: string;
  masterListingId: string;
  marketplaceId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  photoOrder: string[];
  marketplaceNotes: string;
  status: ListingStatus;
  externalId?: string;
}
export interface MasterListing extends AIAnalysis {
  id: string;
  photos: string[];
  marketplaceListings: MarketplaceListing[];
  createdAt: string;
  soldAt?: string;
  salePrice?: number;
  soldMarketplaceId?: string;
  saleNotes?: string;
}
export interface UserPreferences {
  onboarded: boolean;
  clearOutCategories: string[];
  countryCode: CountryCode;
}
