import {
  ClearoutSale,
  Conversation,
  CountryCode,
  Listing,
  Offer,
  SellerProfile,
} from "../types/domain";
import {
  formatApproximateLocation,
  getCities,
  REGIONS,
} from "../config/regions";
export const CURRENT_USER_ID = "demo-user";
export const DEMO_PROFILES: SellerProfile[] = [
  {
    id: CURRENT_USER_ID,
    displayName: "Liezel",
    approximateLocation: "Waterford City, Waterford",
    memberSince: "2026-09-01",
    isDemo: true,
  },
  {
    id: "sarah",
    displayName: "Sarah",
    approximateLocation: "Tramore, Waterford",
    memberSince: "2026-05-12",
    isDemo: true,
  },
  {
    id: "tom",
    displayName: "Tom",
    approximateLocation: "Dungarvan, Waterford",
    memberSince: "2026-02-08",
    isDemo: true,
  },
  {
    id: "aoife",
    displayName: "Aoife",
    approximateLocation: "Waterford City, Waterford",
    memberSince: "2026-07-18",
    isDemo: true,
  },
];
const img = {
  coffee:
    "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80",
  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  kids: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=80",
  table:
    "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=900&q=80",
  lamp: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  fryer:
    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80",
  chair:
    "https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=900&q=80",
};
const base = (
  id: string,
  title: string,
  price: number,
  category: string,
  location: string,
  sellerId: string,
  photo: string,
  saleId?: string,
): Listing => ({
  id,
  title,
  askingPrice: price,
  suggestedPrice: price,
  priceConfidence: 0.7,
  category,
  subcategory: category,
  brand: "",
  condition: "Good",
  description: `${title} in good used condition. Demo listing — please review photos and ask the seller any questions.`,
  tags: [category.toLowerCase()],
  approximateLocation: location,
  sellerId,
  saleId,
  photos: [photo],
  currency: "EUR",
  status: "LIVE",
  createdAt: new Date(
    Date.now() - Number(id.replace(/\D/g, "")) * 3600000,
  ).toISOString(),
  isDemo: true,
});
export const DEMO_LISTINGS: Listing[] = [
  base(
    "demo-1",
    "Coffee machine",
    25,
    "Home",
    "Waterford City, Waterford",
    "sarah",
    img.coffee,
    "sale-sarah",
  ),
  base(
    "demo-2",
    "Nike trainers",
    35,
    "Fashion",
    "Waterford City, Waterford",
    "sarah",
    img.shoes,
    "sale-sarah",
  ),
  base(
    "demo-3",
    "Kids clothes bundle",
    20,
    "Kids",
    "Tramore, Waterford",
    "aoife",
    img.kids,
    "sale-kids",
  ),
  base(
    "demo-4",
    "Oak side table",
    30,
    "Home",
    "Waterford City, Waterford",
    "sarah",
    img.table,
    "sale-sarah",
  ),
  base(
    "demo-5",
    "Bedside lamp",
    12,
    "Home",
    "Dungarvan, Waterford",
    "tom",
    img.lamp,
  ),
  base(
    "demo-6",
    "Air fryer",
    40,
    "Electronics",
    "Tramore, Waterford",
    "aoife",
    img.fryer,
    "sale-kids",
  ),
  base(
    "demo-7",
    "Baby high chair",
    15,
    "Kids",
    "Waterford City, Waterford",
    "aoife",
    img.chair,
    "sale-kids",
  ),
  base(
    "demo-8",
    "Desk chair",
    20,
    "Home",
    "Waterford City, Waterford",
    CURRENT_USER_ID,
    img.chair,
    "sale-liezel",
  ),
];
export const DEMO_SALES: ClearoutSale[] = [
  {
    id: "sale-liezel",
    sellerId: CURRENT_USER_ID,
    title: "Liezel’s Clear-Out",
    description: "A few useful things ready for a new home.",
    approximateLocation: "Waterford City, Waterford",
    coverImage: img.chair,
    itemCount: 1,
    createdAt: new Date().toISOString(),
    status: "LIVE",
    isDemo: true,
  },
  {
    id: "sale-sarah",
    sellerId: "sarah",
    title: "Sarah’s Moving Sale",
    description: "Useful home items looking for a new home.",
    approximateLocation: "Waterford City, Waterford",
    coverImage: img.coffee,
    itemCount: 3,
    createdAt: new Date().toISOString(),
    status: "LIVE",
    isDemo: true,
  },
  {
    id: "sale-kids",
    sellerId: "aoife",
    title: "Kids Stuff Clear-Out",
    description: "Clothes and equipment our family has outgrown.",
    approximateLocation: "Tramore, Waterford",
    coverImage: img.kids,
    itemCount: 3,
    createdAt: new Date().toISOString(),
    status: "LIVE",
    isDemo: true,
  },
];
export const DEMO_OFFERS: Offer[] = [
  {
    id: "offer-1",
    listingIds: ["demo-1"],
    buyerId: CURRENT_USER_ID,
    sellerId: "sarah",
    amount: 20,
    currency: "EUR",
    status: "COUNTERED",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    message: "Would you take €20?",
    isDemo: true,
  },
  {
    id: "offer-2",
    listingIds: ["demo-8"],
    buyerId: "tom",
    sellerId: CURRENT_USER_ID,
    amount: 10,
    currency: "EUR",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    message: "Could collect Saturday.",
    isDemo: true,
  },
];
export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conversation-1",
    memberIds: [CURRENT_USER_ID, "sarah"],
    listingId: "demo-1",
    offerId: "offer-1",
    updatedAt: new Date().toISOString(),
    isDemo: true,
    messages: [
      {
        id: "msg-1",
        conversationId: "conversation-1",
        senderId: "sarah",
        body: "Would you take €30?",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isDemo: true,
      },
      {
        id: "msg-2",
        conversationId: "conversation-1",
        senderId: CURRENT_USER_ID,
        body: "I could do €35.",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isDemo: true,
      },
      {
        id: "msg-3",
        conversationId: "conversation-1",
        senderId: "sarah",
        body: "Perfect. Can I collect Saturday?",
        createdAt: new Date().toISOString(),
        isDemo: true,
      },
    ],
  },
];

export interface DemoMarketplaceData {
  profiles: SellerProfile[];
  listings: Listing[];
  sales: ClearoutSale[];
  offers: Offer[];
  conversations: Conversation[];
}

/**
 * Builds clearly demo-only marketplace data for the user's configured broad
 * area. This is intentionally a replaceable development-data boundary, not a
 * claim that these sellers or items exist in the selected location.
 */
export function getRegionalDemoMarketplace(
  countryCode: CountryCode,
  region: string,
  town: string,
): DemoMarketplaceData {
  const configuredCities = getCities(countryCode, region);
  const cities = [town, ...configuredCities.filter((city) => city !== town)];
  const locations = Array.from({ length: 4 }, (_, index) =>
    formatApproximateLocation(
      countryCode,
      region,
      cities[index % cities.length] ?? town,
    ),
  );
  const currency = REGIONS[countryCode].currency;
  const listingLocations = [
    locations[0],
    locations[0],
    locations[1],
    locations[0],
    locations[2],
    locations[1],
    locations[0],
    locations[0],
  ];

  const profiles = DEMO_PROFILES.map((profile, index) => ({
    ...profile,
    approximateLocation: locations[index % locations.length],
  }));
  const listings = DEMO_LISTINGS.map((listing, index) => ({
    ...listing,
    currency,
    approximateLocation: listingLocations[index],
  }));
  const saleLocations: Record<string, string> = {
    "sale-liezel": locations[0],
    "sale-sarah": locations[0],
    "sale-kids": locations[1],
  };
  const sales = DEMO_SALES.map((sale) => ({
    ...sale,
    approximateLocation: saleLocations[sale.id] ?? locations[0],
  }));
  const offers = DEMO_OFFERS.map((offer) => ({ ...offer, currency }));

  return {
    profiles,
    listings,
    sales,
    offers,
    conversations: DEMO_CONVERSATIONS.map((conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) => ({ ...message })),
    })),
  };
}
