import { CountryCode } from "../types/domain";
export const REGIONS: Record<
  CountryCode,
  { name: string; currency: string; symbol: string }
> = {
  IE: { name: "Ireland", currency: "EUR", symbol: "€" },
  GB: { name: "United Kingdom", currency: "GBP", symbol: "£" },
  ZA: { name: "South Africa", currency: "ZAR", symbol: "R" },
  US: { name: "United States", currency: "USD", symbol: "$" },
  AU: { name: "Australia", currency: "AUD", symbol: "$" },
};
export const COUNTRIES = (Object.keys(REGIONS) as CountryCode[]).map(
  (code) => ({ code, name: REGIONS[code].name }),
);
export const IRISH_COUNTIES = [
  "Waterford",
  "Dublin",
  "Cork",
  "Galway",
  "Wexford",
  "Kilkenny",
  "Tipperary",
  "Limerick",
];
export const CATEGORIES = [
  "Home",
  "Kids",
  "Fashion",
  "Electronics",
  "Garden",
  "Sports",
  "Other",
];
