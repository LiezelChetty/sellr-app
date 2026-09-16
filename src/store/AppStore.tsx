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
  CURRENT_USER_ID,
  DEMO_CONVERSATIONS,
  DEMO_LISTINGS,
  DEMO_OFFERS,
  DEMO_PROFILES,
  DEMO_SALES,
  getRegionalDemoMarketplace,
} from "../data/demo";
import { formatApproximateLocation, REGIONS } from "../config/regions";
import {
  AIAnalysis,
  ClearoutSale,
  Conversation,
  CountryCode,
  Listing,
  Offer,
  OfferStatus,
  SellerProfile,
  UserPreferences,
} from "../types/domain";
const STORAGE_KEY = "offerme.v1.state";
const initialPreferences: UserPreferences = {
  onboarded: false,
  countryCode: "IE",
  region: "Waterford",
  town: "Waterford City",
};
interface StoreValue {
  ready: boolean;
  preferences: UserPreferences;
  profiles: SellerProfile[];
  listings: Listing[];
  sales: ClearoutSale[];
  offers: Offer[];
  conversations: Conversation[];
  favouriteIds: string[];
  completeOnboarding(
    countryCode: CountryCode,
    region: string,
    town: string,
  ): void;
  updateLocation(countryCode: CountryCode, region: string, town: string): void;
  addListing(input: AIAnalysis & { photos: string[]; saleId?: string }): string;
  addSale(title: string, description: string, listingIds: string[]): string;
  toggleFavourite(id: string): void;
  createOffer(listingId: string, amount: number, message: string): string;
  updateOffer(id: string, status: OfferStatus, amount?: number): void;
  sendMessage(conversationId: string, body: string): void;
  startConversation(listingId: string): string;
  markSold(id: string): void;
  resetDemo(): void;
}
const Store = createContext<StoreValue | null>(null);
export function AppStoreProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [listings, setListings] = useState(DEMO_LISTINGS);
  const [sales, setSales] = useState(DEMO_SALES);
  const [profiles, setProfiles] = useState(DEMO_PROFILES);
  const [offers, setOffers] = useState(DEMO_OFFERS);
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [favouriteIds, setFavouriteIds] = useState<string[]>(["demo-2"]);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const s = JSON.parse(raw);
          const savedPreferences = s.preferences ?? initialPreferences;
          const hydratedPreferences = {
            ...initialPreferences,
            ...savedPreferences,
            region:
              savedPreferences.region ??
              savedPreferences.county ??
              initialPreferences.region,
          };
          const regionalDemo = getRegionalDemoMarketplace(
            hydratedPreferences.countryCode,
            hydratedPreferences.region,
            hydratedPreferences.town,
          );
          setPreferences(hydratedPreferences);
          setProfiles(regionalDemo.profiles);
          setListings([
            ...regionalDemo.listings,
            ...(s.listings ?? []).filter((listing: Listing) => !listing.isDemo),
          ]);
          setSales([
            ...regionalDemo.sales,
            ...(s.sales ?? []).filter((sale: ClearoutSale) => !sale.isDemo),
          ]);
          setOffers([
            ...regionalDemo.offers,
            ...(s.offers ?? []).filter((offer: Offer) => !offer.isDemo),
          ]);
          setConversations([
            ...regionalDemo.conversations,
            ...(s.conversations ?? []).filter(
              (conversation: Conversation) => !conversation.isDemo,
            ),
          ]);
          setFavouriteIds(s.favouriteIds ?? []);
        }
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          preferences,
          listings,
          sales,
          offers,
          conversations,
          favouriteIds,
        }),
      );
  }, [
    ready,
    preferences,
    listings,
    sales,
    offers,
    conversations,
    favouriteIds,
  ]);
  const applyRegionalDemo = (
    countryCode: CountryCode,
    region: string,
    town: string,
  ) => {
    const regionalDemo = getRegionalDemoMarketplace(countryCode, region, town);
    setProfiles(regionalDemo.profiles);
    setListings((current) => [
      ...regionalDemo.listings,
      ...current.filter((listing) => !listing.isDemo),
    ]);
    setSales((current) => [
      ...regionalDemo.sales,
      ...current.filter((sale) => !sale.isDemo),
    ]);
    setOffers((current) => [
      ...regionalDemo.offers,
      ...current.filter((offer) => !offer.isDemo),
    ]);
    setConversations((current) => [
      ...regionalDemo.conversations,
      ...current.filter((conversation) => !conversation.isDemo),
    ]);
  };
  const value = useMemo<StoreValue>(
    () => ({
      ready,
      preferences,
      profiles,
      listings,
      sales,
      offers,
      conversations,
      favouriteIds,
      completeOnboarding: (countryCode, region, town) => {
        setPreferences({ onboarded: true, countryCode, region, town });
        applyRegionalDemo(countryCode, region, town);
      },
      updateLocation: (countryCode, region, town) => {
        setPreferences((current) => ({
          ...current,
          countryCode,
          region,
          town,
        }));
        applyRegionalDemo(countryCode, region, town);
      },
      addListing: (input) => {
        const id = `listing-${Date.now()}`;
        setListings((x) => [
          {
            ...input,
            id,
            sellerId: CURRENT_USER_ID,
            askingPrice: input.suggestedPrice,
            currency: REGIONS[preferences.countryCode].currency,
            status: "LIVE",
            approximateLocation: formatApproximateLocation(
              preferences.countryCode,
              preferences.region,
              preferences.town,
            ),
            createdAt: new Date().toISOString(),
          },
          ...x,
        ]);
        return id;
      },
      addSale: (title, description, listingIds) => {
        const id = `sale-${Date.now()}`;
        const coverImage = listings.find((l) => listingIds.includes(l.id))
          ?.photos[0];
        setSales((x) => [
          {
            id,
            sellerId: CURRENT_USER_ID,
            title,
            description,
            approximateLocation: formatApproximateLocation(
              preferences.countryCode,
              preferences.region,
              preferences.town,
            ),
            coverImage,
            itemCount: listingIds.length,
            createdAt: new Date().toISOString(),
            status: "LIVE",
          },
          ...x,
        ]);
        setListings((x) =>
          x.map((l) => (listingIds.includes(l.id) ? { ...l, saleId: id } : l)),
        );
        return id;
      },
      toggleFavourite: (id) =>
        setFavouriteIds((x) =>
          x.includes(id) ? x.filter((v) => v !== id) : [...x, id],
        ),
      createOffer: (listingId, amount, message) => {
        const listing = listings.find((x) => x.id === listingId)!;
        const id = `offer-${Date.now()}`;
        const offer: Offer = {
          id,
          listingIds: [listingId],
          buyerId: CURRENT_USER_ID,
          sellerId: listing.sellerId,
          amount,
          currency: listing.currency,
          status: "PENDING",
          message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setOffers((x) => [offer, ...x]);
        return id;
      },
      updateOffer: (id, status, amount) =>
        setOffers((x) =>
          x.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  amount: amount ?? o.amount,
                  updatedAt: new Date().toISOString(),
                  parentOfferId:
                    status === "COUNTERED" ? o.id : o.parentOfferId,
                }
              : o,
          ),
        ),
      sendMessage: (conversationId, body) =>
        setConversations((x) =>
          x.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  messages: [
                    ...c.messages,
                    {
                      id: `msg-${Date.now()}`,
                      conversationId,
                      senderId: CURRENT_USER_ID,
                      body,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : c,
          ),
        ),
      startConversation: (listingId) => {
        const existing = conversations.find(
          (c) =>
            c.listingId === listingId && c.memberIds.includes(CURRENT_USER_ID),
        );
        if (existing) return existing.id;
        const listing = listings.find((x) => x.id === listingId)!;
        const id = `conversation-${Date.now()}`;
        setConversations((x) => [
          {
            id,
            listingId,
            memberIds: [CURRENT_USER_ID, listing.sellerId],
            messages: [],
            updatedAt: new Date().toISOString(),
          },
          ...x,
        ]);
        return id;
      },
      markSold: (id) =>
        setListings((x) =>
          x.map((l) =>
            l.id === id
              ? { ...l, status: "SOLD", soldAt: new Date().toISOString() }
              : l,
          ),
        ),
      resetDemo: () => {
        const regionalDemo = getRegionalDemoMarketplace(
          initialPreferences.countryCode,
          initialPreferences.region,
          initialPreferences.town,
        );
        setPreferences(initialPreferences);
        setProfiles(regionalDemo.profiles);
        setListings(regionalDemo.listings);
        setSales(regionalDemo.sales);
        setOffers(regionalDemo.offers);
        setConversations(regionalDemo.conversations);
        setFavouriteIds(["demo-2"]);
        AsyncStorage.removeItem(STORAGE_KEY);
      },
    }),
    [
      ready,
      preferences,
      profiles,
      listings,
      sales,
      offers,
      conversations,
      favouriteIds,
    ],
  );
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
export const useAppStore = () => {
  const x = useContext(Store);
  if (!x) throw new Error("AppStoreProvider missing");
  return x;
};
