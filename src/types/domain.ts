export type CountryCode = "IE" | "GB" | "ZA" | "US" | "AU";
export type ListingStatus =
  | "DRAFT"
  | "LIVE"
  | "OFFER_ACCEPTED"
  | "SOLD"
  | "ARCHIVED";
export type OfferStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "COUNTERED"
  | "WITHDRAWN"
  | "EXPIRED";
export interface UserPreferences {
  onboarded: boolean;
  countryCode: CountryCode;
  region: string;
  town: string;
}
export interface SellerProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  approximateLocation: string;
  memberSince: string;
  isDemo?: boolean;
}
export interface AIAnalysis {
  title: string;
  category: string;
  subcategory: string;
  brand: string;
  condition: string;
  description: string;
  suggestedPrice: number;
  priceConfidence: number;
  tags: string[];
}
export interface Listing extends AIAnalysis {
  id: string;
  sellerId: string;
  saleId?: string;
  photos: string[];
  askingPrice: number;
  currency: string;
  approximateLocation: string;
  status: ListingStatus;
  createdAt: string;
  soldAt?: string;
  isDemo?: boolean;
}
export interface ClearoutSale {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  approximateLocation: string;
  coverImage?: string;
  itemCount: number;
  createdAt: string;
  status: "DRAFT" | "LIVE" | "ENDED";
  isDemo?: boolean;
}
export interface Offer {
  id: string;
  listingIds: string[];
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  message?: string;
  parentOfferId?: string;
  isDemo?: boolean;
}
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  isDemo?: boolean;
}
export interface Conversation {
  id: string;
  memberIds: string[];
  listingId?: string;
  offerId?: string;
  messages: Message[];
  updatedAt: string;
  isDemo?: boolean;
}
export interface ReportInput {
  targetType: "LISTING" | "USER";
  targetId: string;
  reason: string;
}
