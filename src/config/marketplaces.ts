import { CountryCode, Marketplace, MarketplaceRegion } from "../types/domain";

export const MARKETPLACES: Record<string, Marketplace> = {
  vinted: {
    id: "vinted",
    name: "Vinted",
    summary: "Good for fashion",
    capabilities: ["PREPARE_ONLY", "HANDOFF"],
    handoffUrl: "https://www.vinted.ie/items/new",
  },
  donedeal: {
    id: "donedeal",
    name: "DoneDeal",
    summary: "Irish marketplace",
    capabilities: ["PREPARE_ONLY", "HANDOFF"],
    handoffUrl: "https://www.donedeal.ie/publish",
  },
  facebook: {
    id: "facebook",
    name: "Facebook Marketplace",
    summary: "Useful for local selling",
    capabilities: ["PREPARE_ONLY", "HANDOFF"],
    handoffUrl: "https://www.facebook.com/marketplace/create/item",
  },
  ebay: {
    id: "ebay",
    name: "eBay",
    summary: "Wider audience",
    capabilities: ["PREPARE_ONLY", "OAUTH_AVAILABLE"],
    handoffUrl: "https://www.ebay.ie/sl/sell",
  },
};

export const REGIONS: Record<CountryCode, MarketplaceRegion> = {
  IE: {
    countryCode: "IE",
    marketplaceIds: ["vinted", "donedeal", "facebook", "ebay"],
    currency: "EUR",
    symbol: "€",
  },
  GB: {
    countryCode: "GB",
    marketplaceIds: ["vinted", "facebook", "ebay"],
    currency: "GBP",
    symbol: "£",
  },
  ZA: {
    countryCode: "ZA",
    marketplaceIds: ["facebook"],
    currency: "ZAR",
    symbol: "R",
  },
  US: {
    countryCode: "US",
    marketplaceIds: ["facebook", "ebay"],
    currency: "USD",
    symbol: "$",
  },
  AU: {
    countryCode: "AU",
    marketplaceIds: ["facebook", "ebay"],
    currency: "AUD",
    symbol: "$",
  },
};
export const COUNTRIES: { code: CountryCode; name: string }[] = [
  { code: "IE", name: "Ireland" },
  { code: "GB", name: "United Kingdom" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
  { code: "AU", name: "Australia" },
];
export const getRegionalMarketplaces = (country: CountryCode) =>
  REGIONS[country].marketplaceIds.map((id) => MARKETPLACES[id]);
