import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AIAnalysis,
  CountryCode,
  MasterListing,
  MarketplaceListing,
  UserPreferences,
} from "../types/domain";

const STORAGE_KEY = "sellr.v1.state";
const initialPreferences: UserPreferences = {
  onboarded: false,
  clearOutCategories: [],
  countryCode: "IE",
};
type DraftInput = AIAnalysis & { photos: string[]; marketplaceIds: string[] };
interface StoreValue {
  ready: boolean;
  preferences: UserPreferences;
  listings: MasterListing[];
  completeOnboarding(categories: string[], countryCode: CountryCode): void;
  setCountry(countryCode: CountryCode): void;
  addListing(input: DraftInput): string;
  updateMarketplaceListing(
    masterId: string,
    marketplaceId: string,
    patch: Partial<MarketplaceListing>,
  ): void;
  markSold(
    masterId: string,
    marketplaceId: string,
    price: number,
    notes: string,
  ): void;
  resetDemo(): void;
}
const Store = createContext<StoreValue | null>(null);
const draftFor = (
  masterId: string,
  marketplaceId: string,
  input: DraftInput,
): MarketplaceListing => ({
  id: `${masterId}-${marketplaceId}`,
  masterListingId: masterId,
  marketplaceId,
  title: input.title,
  description: input.description,
  price: input.recommendedPrice,
  category: input.category,
  tags: [input.brand, input.subcategory, input.condition].filter(Boolean),
  photoOrder: input.photos,
  marketplaceNotes:
    "Prepared by SELLR. Review the marketplace’s rules and required fields before listing.",
  status: "READY",
});

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [listings, setListings] = useState<MasterListing[]>([]);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw);
          setPreferences(saved.preferences ?? initialPreferences);
          setListings(saved.listings ?? []);
        }
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ preferences, listings }),
      );
  }, [ready, preferences, listings]);
  const value = useMemo<StoreValue>(
    () => ({
      ready,
      preferences,
      listings,
      completeOnboarding: (clearOutCategories, countryCode) =>
        setPreferences({ onboarded: true, clearOutCategories, countryCode }),
      setCountry: (countryCode) =>
        setPreferences((p) => ({ ...p, countryCode })),
      addListing: (input) => {
        const id = `item-${Date.now()}`;
        const item: MasterListing = {
          ...input,
          id,
          createdAt: new Date().toISOString(),
          marketplaceListings: input.marketplaceIds.map((mid) =>
            draftFor(id, mid, input),
          ),
        };
        setListings((items) => [item, ...items]);
        return id;
      },
      updateMarketplaceListing: (masterId, marketplaceId, patch) =>
        setListings((items) =>
          items.map((item) =>
            item.id === masterId
              ? {
                  ...item,
                  marketplaceListings: item.marketplaceListings.map((m) =>
                    m.marketplaceId === marketplaceId ? { ...m, ...patch } : m,
                  ),
                }
              : item,
          ),
        ),
      markSold: (masterId, marketplaceId, salePrice, saleNotes) =>
        setListings((items) =>
          items.map((item) =>
            item.id === masterId
              ? {
                  ...item,
                  soldAt: new Date().toISOString(),
                  soldMarketplaceId: marketplaceId,
                  salePrice,
                  saleNotes,
                  marketplaceListings: item.marketplaceListings.map((m) =>
                    m.marketplaceId === marketplaceId
                      ? { ...m, status: "SOLD" }
                      : m,
                  ),
                }
              : item,
          ),
        ),
      resetDemo: () => {
        setPreferences(initialPreferences);
        setListings([]);
        AsyncStorage.removeItem(STORAGE_KEY);
      },
    }),
    [ready, preferences, listings],
  );
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
export const useAppStore = () => {
  const value = useContext(Store);
  if (!value) throw new Error("AppStoreProvider missing");
  return value;
};
