import { supabase } from "../lib/supabase";
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

const client = () => {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
};
const photoUrl = (path: string) =>
  client().storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
const must = <T>(data: T | null, error: { message: string } | null): T => {
  if (error) throw new Error(error.message);
  if (data == null) throw new Error("The server returned no data.");
  return data;
};

export async function loadMarketplace(
  userId: string,
  prefs: UserPreferences,
  page = 0,
  pageSize = 40,
) {
  const db = client();
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const [
    listingResult,
    ownListingsResult,
    salesResult,
    ownSalesResult,
    profilesResult,
    favouritesResult,
    offersResult,
    membershipsResult,
  ] = await Promise.all([
    db
      .from("listings")
      .select("*,listing_photos(*)")
      .eq("country_code", prefs.countryCode)
      .eq("region", prefs.region)
      .order("created_at", { ascending: false })
      .range(from, to),
    db
      .from("listings")
      .select("*,listing_photos(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    db
      .from("clearout_sales")
      .select("*")
      .eq("country_code", prefs.countryCode)
      .eq("region", prefs.region)
      .order("created_at", { ascending: false })
      .range(from, to),
    db
      .from("clearout_sales")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false }),
    db
      .from("profiles")
      .select(
        "id,display_name,avatar_path,member_since,approximate_location,country_code,region,town",
      ),
    db.from("favourites").select("listing_id").eq("user_id", userId),
    db.from("offers").select("*").order("updated_at", { ascending: false }),
    db
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", userId),
  ]);
  for (const result of [
    listingResult,
    ownListingsResult,
    salesResult,
    ownSalesResult,
    profilesResult,
    favouritesResult,
    offersResult,
    membershipsResult,
  ])
    if (result.error) throw new Error(result.error.message);
  const conversationIds = (membershipsResult.data ?? []).map(
    (x) => x.conversation_id,
  );
  const conversationsResult = conversationIds.length
    ? await db
        .from("conversations")
        .select("*,conversation_members(user_id),messages(*)")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })
    : { data: [], error: null };
  if (conversationsResult.error)
    throw new Error(conversationsResult.error.message);
  const favouriteIds = (favouritesResult.data ?? []).map((x) => x.listing_id);
  const favouriteListingsResult = favouriteIds.length
    ? await db
        .from("listings")
        .select("*,listing_photos(*)")
        .in("id", favouriteIds)
    : { data: [], error: null };
  if (favouriteListingsResult.error)
    throw new Error(favouriteListingsResult.error.message);
  const profiles: SellerProfile[] = (profilesResult.data ?? []).map((p) => ({
    id: p.id,
    displayName: p.display_name || "OfferMe member",
    avatarUrl: p.avatar_path || undefined,
    approximateLocation: p.approximate_location || "Area not set",
    memberSince: p.member_since,
  }));
  const rawListings = [
    ...(listingResult.data ?? []),
    ...(ownListingsResult.data ?? []),
    ...(favouriteListingsResult.data ?? []),
  ].filter(
    (listing, index, all) =>
      all.findIndex((candidate) => candidate.id === listing.id) === index,
  );
  const listings: Listing[] = rawListings.map((l: any) => ({
    id: l.id,
    sellerId: l.user_id,
    saleId: l.clearout_sale_id || undefined,
    title: l.title,
    brand: l.brand || "",
    category: l.category || "Other",
    subcategory: l.subcategory || "",
    condition: l.condition || "Used",
    description: l.description || "",
    suggestedPrice: Number(l.recommended_price ?? l.asking_price ?? 0),
    askingPrice: Number(l.asking_price ?? l.recommended_price ?? 0),
    priceConfidence: Number(l.analysis_confidence ?? 0),
    tags: l.tags ?? [],
    currency: l.currency,
    approximateLocation: l.approximate_location,
    status: l.status,
    createdAt: l.created_at,
    soldAt: l.sold_at || undefined,
    photos: (l.listing_photos ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((p: any) =>
        photoUrl(p.display_storage_path || p.original_storage_path),
      ),
  }));
  const rawSales = [
    ...(salesResult.data ?? []),
    ...(ownSalesResult.data ?? []),
  ].filter(
    (sale, index, all) =>
      all.findIndex((candidate) => candidate.id === sale.id) === index,
  );
  const sales: ClearoutSale[] = rawSales.map((s: any) => ({
    id: s.id,
    sellerId: s.seller_id,
    title: s.title,
    description: s.description,
    approximateLocation: s.approximate_location,
    coverImage: listings.find((l) => l.saleId === s.id)?.photos[0],
    itemCount: listings.filter((l) => l.saleId === s.id && l.status === "LIVE")
      .length,
    createdAt: s.created_at,
    status: s.status,
  }));
  const offers: Offer[] = (offersResult.data ?? []).map((o: any) => ({
    id: o.id,
    listingIds: o.listing_ids,
    buyerId: o.buyer_id,
    sellerId: o.seller_id,
    amount: Number(o.amount),
    currency: o.currency,
    status: o.status,
    message: o.message || undefined,
    parentOfferId: o.parent_offer_id || undefined,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }));
  const conversations: Conversation[] = (conversationsResult.data ?? []).map(
    (c: any) => ({
      id: c.id,
      listingId: c.listing_id || undefined,
      offerId: c.offer_id || undefined,
      memberIds: (c.conversation_members ?? []).map((m: any) => m.user_id),
      updatedAt: c.updated_at,
      messages: (c.messages ?? [])
        .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
        .map((m: any) => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          body: m.body,
          createdAt: m.created_at,
        })),
    }),
  );
  return { profiles, listings, sales, offers, conversations, favouriteIds };
}

export async function createListing(
  userId: string,
  prefs: UserPreferences,
  currency: string,
  input: AIAnalysis & { photos: string[]; saleId?: string },
): Promise<Listing> {
  const db = client();
  const listingResult = await db
    .from("listings")
    .insert({
      user_id: userId,
      title: input.title,
      brand: input.brand || null,
      category: input.category,
      subcategory: input.subcategory || null,
      condition: input.condition,
      description: input.description,
      recommended_price: input.suggestedPrice,
      asking_price: input.suggestedPrice,
      currency,
      analysis_confidence: input.priceConfidence,
      analysis_source:
        input.analysisSource === "vision"
          ? "openai_vision_reviewed"
          : input.analysisSource === "development"
            ? "development_manual"
            : "manual",
      status: "LIVE",
      tags: input.tags,
      country_code: prefs.countryCode,
      region: prefs.region,
      town: prefs.town,
      approximate_location: `${prefs.town}, ${prefs.region}`,
      clearout_sale_id: input.saleId || null,
    })
    .select("*")
    .single();
  const row = must(listingResult.data, listingResult.error);
  const uploaded: string[] = [];
  try {
    for (let index = 0; index < input.photos.length; index += 1) {
      const uri = input.photos[index];
      const response = await fetch(uri);
      const bytes = await response.arrayBuffer();
      const extension =
        uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
      const path = `${userId}/${row.id}/${index}-${Date.now()}.${extension}`;
      const upload = await db.storage
        .from("listing-photos")
        .upload(path, bytes, {
          contentType: response.headers.get("content-type") || "image/jpeg",
          upsert: false,
        });
      if (upload.error) throw upload.error;
      uploaded.push(path);
      const photoInsert = await db
        .from("listing_photos")
        .insert({
          master_listing_id: row.id,
          original_storage_path: path,
          sort_order: index,
        });
      if (photoInsert.error) throw photoInsert.error;
    }
  } catch (error) {
    if (uploaded.length)
      await db.storage.from("listing-photos").remove(uploaded);
    await db.from("listings").delete().eq("id", row.id);
    throw error;
  }
  return {
    ...input,
    id: row.id,
    sellerId: userId,
    askingPrice: input.suggestedPrice,
    currency,
    status: "LIVE",
    approximateLocation: row.approximate_location,
    createdAt: row.created_at,
    photos: uploaded.map(photoUrl),
  };
}

export async function setFavourite(
  userId: string,
  listingId: string,
  active: boolean,
) {
  const result = active
    ? await client()
        .from("favourites")
        .insert({ user_id: userId, listing_id: listingId })
    : await client()
        .from("favourites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);
  if (result.error) throw new Error(result.error.message);
}
export async function createMarketplaceOffer(
  userId: string,
  listing: Listing,
  amount: number,
  message: string,
) {
  const result = await client()
    .from("offers")
    .insert({
      listing_ids: [listing.id],
      buyer_id: userId,
      seller_id: listing.sellerId,
      amount,
      currency: listing.currency,
      message: message || null,
    })
    .select("*")
    .single();
  return must(result.data, result.error) as any;
}
export async function transitionMarketplaceOffer(
  id: string,
  status: OfferStatus,
  amount?: number,
) {
  const action = (
    {
      ACCEPTED: "ACCEPT",
      DECLINED: "DECLINE",
      WITHDRAWN: "WITHDRAW",
      COUNTERED: "COUNTER",
    } as Partial<Record<OfferStatus, string>>
  )[status];
  if (!action) throw new Error("This offer transition is not supported.");
  const result = await client().rpc("transition_offer", {
    p_offer_id: id,
    p_action: action,
    p_counter_amount: amount ?? null,
  });
  return must(result.data, result.error) as any;
}
export async function startMarketplaceConversation(listingId: string) {
  const result = await client().rpc("start_listing_conversation", {
    p_listing_id: listingId,
  });
  return must(result.data, result.error) as string;
}
export async function sendMarketplaceMessage(
  userId: string,
  conversationId: string,
  body: string,
) {
  const result = await client()
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: userId, body })
    .select("*")
    .single();
  return must(result.data, result.error) as any;
}
export async function createClearout(
  userId: string,
  prefs: UserPreferences,
  title: string,
  description: string,
  listingIds: string[],
) {
  const db = client();
  const approximate = `${prefs.town}, ${prefs.region}`;
  const result = await db
    .from("clearout_sales")
    .insert({
      seller_id: userId,
      title,
      description,
      approximate_location: approximate,
      country_code: prefs.countryCode,
      region: prefs.region,
      town: prefs.town,
      status: "LIVE",
    })
    .select("*")
    .single();
  const row = must(result.data, result.error);
  const link = await db
    .from("listings")
    .update({ clearout_sale_id: row.id })
    .in("id", listingIds)
    .eq("user_id", userId);
  if (link.error) throw new Error(link.error.message);
  return row as any;
}
export async function markMarketplaceListingSold(userId: string, id: string) {
  const result = await client()
    .from("listings")
    .update({ status: "SOLD", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (result.error) throw new Error(result.error.message);
}
export async function reportMarketplaceTarget(
  userId: string,
  targetType: "LISTING" | "USER",
  targetId: string,
  reason: string,
) {
  const result = await client()
    .from("reports")
    .insert({
      reporter_id: userId,
      target_type: targetType,
      target_id: targetId,
      reason,
    });
  if (result.error) throw new Error(result.error.message);
}
export function subscribeToMessages(
  conversationIds: string[],
  onChange: () => void,
) {
  if (!supabase || !conversationIds.length) return () => undefined;
  const realtime = supabase;
  const channel = realtime
    .channel("offerme-messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        if (conversationIds.includes((payload.new as any).conversation_id))
          onChange();
      },
    )
    .subscribe();
  return () => {
    realtime.removeChannel(channel);
  };
}
