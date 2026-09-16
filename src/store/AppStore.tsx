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
import { useAuth } from "./AuthStore";
import {
  createClearout,
  createListing,
  createMarketplaceOffer,
  loadMarketplace,
  markMarketplaceListingSold,
  sendMarketplaceMessage,
  setFavourite,
  startMarketplaceConversation,
  subscribeToMessages,
  transitionMarketplaceOffer,
  reportMarketplaceTarget,
} from "../services/marketplace";
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
  demoMode: boolean;
  currentUserId: string;
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
  updateLocation(countryCode: CountryCode, region: string, town: string): Promise<void>;
  addListing(input: AIAnalysis & { photos: string[]; saleId?: string }): Promise<string>;
  addSale(title: string, description: string, listingIds: string[]): Promise<string>;
  toggleFavourite(id: string): Promise<void>;
  createOffer(listingId: string, amount: number, message: string): Promise<string>;
  updateOffer(id: string, status: OfferStatus, amount?: number): Promise<void>;
  sendMessage(conversationId: string, body: string): Promise<void>;
  startConversation(listingId: string): Promise<string>;
  markSold(id: string): Promise<void>;
  reportListing(id: string, reason: string): Promise<void>;
  resetDemo(): void;
}
const Store = createContext<StoreValue | null>(null);
export function AppStoreProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [listings, setListings] = useState(DEMO_LISTINGS);
  const [sales, setSales] = useState(DEMO_SALES);
  const [profiles, setProfiles] = useState(DEMO_PROFILES);
  const [offers, setOffers] = useState(DEMO_OFFERS);
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [favouriteIds, setFavouriteIds] = useState<string[]>(["demo-2"]);
  const currentUserId = auth.demoMode ? CURRENT_USER_ID : (auth.user?.id ?? "");

  const refreshBackend = async () => {
    if (auth.demoMode || !auth.user || !auth.preferences?.onboarded) return;
    const data = await loadMarketplace(auth.user.id, auth.preferences);
    setPreferences(auth.preferences);
    setProfiles(data.profiles);
    setListings(data.listings);
    setSales(data.sales);
    setOffers(data.offers);
    setConversations(data.conversations);
    setFavouriteIds(data.favouriteIds);
  };
  useEffect(() => {
    if (!auth.demoMode) {
      refreshBackend().finally(() => setReady(true));
      return;
    }
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
  }, [auth.demoMode, auth.user?.id, auth.preferences?.onboarded, auth.preferences?.countryCode, auth.preferences?.region]);
  useEffect(() => {
    if (ready && auth.demoMode)
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
    auth.demoMode,
  ]);
  useEffect(() => {
    if (auth.demoMode) return;
    return subscribeToMessages(conversations.map((c) => c.id), () => refreshBackend().catch(() => undefined));
  }, [auth.demoMode, conversations.map((c) => c.id).join(",")]);
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
      demoMode: auth.demoMode,
      currentUserId,
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
      updateLocation: async (countryCode, region, town) => {
        if (!auth.demoMode) {
          const result = await auth.completeProfile({ displayName: auth.profile?.displayName ?? "OfferMe member", countryCode, region, town });
          if (result.error) throw new Error(result.error);
          setPreferences({ onboarded: true, countryCode, region, town });
          const data = await loadMarketplace(currentUserId, { onboarded: true, countryCode, region, town });
          setProfiles(data.profiles); setListings(data.listings); setSales(data.sales); setOffers(data.offers); setConversations(data.conversations); setFavouriteIds(data.favouriteIds);
          return;
        }
        setPreferences((current) => ({
          ...current,
          countryCode,
          region,
          town,
        }));
        applyRegionalDemo(countryCode, region, town);
      },
      addListing: async (input) => {
        if (!auth.demoMode) {
          const listing = await createListing(currentUserId, preferences, REGIONS[preferences.countryCode].currency, input);
          setListings((x) => [listing, ...x]);
          return listing.id;
        }
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
      addSale: async (title, description, listingIds) => {
        if (!auth.demoMode) {
          const sale = await createClearout(currentUserId, preferences, title, description, listingIds);
          await refreshBackend();
          return sale.id;
        }
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
      toggleFavourite: async (id) => {
        const active = !favouriteIds.includes(id);
        setFavouriteIds((x) => active ? [...x, id] : x.filter((v) => v !== id));
        if (!auth.demoMode) {
          try { await setFavourite(currentUserId, id, active); }
          catch (error) { setFavouriteIds((x) => active ? x.filter((v) => v !== id) : [...x, id]); throw error; }
        }
      },
      createOffer: async (listingId, amount, message) => {
        const listing = listings.find((x) => x.id === listingId)!;
        if (!auth.demoMode) {
          const row = await createMarketplaceOffer(currentUserId, listing, amount, message);
          await refreshBackend();
          return row.id;
        }
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
      updateOffer: async (id, status, amount) => {
        if (!auth.demoMode) {
          await transitionMarketplaceOffer(id, status, amount);
          await refreshBackend();
          return;
        }
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
        );
      },
      sendMessage: async (conversationId, body) => {
        if (!auth.demoMode) {
          await sendMarketplaceMessage(currentUserId, conversationId, body);
          await refreshBackend();
          return;
        }
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
        );
      },
      startConversation: async (listingId) => {
        const existing = conversations.find(
          (c) =>
            c.listingId === listingId && c.memberIds.includes(currentUserId),
        );
        if (existing) return existing.id;
        if (!auth.demoMode) {
          const id = await startMarketplaceConversation(listingId);
          await refreshBackend();
          return id;
        }
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
      markSold: async (id) => {
        if (!auth.demoMode) await markMarketplaceListingSold(currentUserId, id);
        setListings((x) =>
          x.map((l) =>
            l.id === id
              ? { ...l, status: "SOLD", soldAt: new Date().toISOString() }
              : l,
          ),
        );
      },
      reportListing: async (id, reason) => {
        if (auth.demoMode) return;
        await reportMarketplaceTarget(currentUserId, "LISTING", id, reason);
      },
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
      auth.demoMode,
      currentUserId,
    ],
  );
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
export const useAppStore = () => {
  const x = useContext(Store);
  if (!x) throw new Error("AppStoreProvider missing");
  return x;
};
