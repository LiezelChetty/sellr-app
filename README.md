# OfferMe

OfferMe is an AI-assisted local marketplace with the simplicity of an online garage sale. Photograph unwanted things, review prepared listings, group them into a clear-out, and receive offers from people in your broad local area.

This repository was pivoted from the earlier foundation and remains at `LiezelChetty/sellr-app`. The current app no longer presents external marketplace publishing or account connections.

## What works locally

- Privacy-conscious onboarding with country, county/region and town/city
- Image-led Home discovery, Browse search/filters, demo clear-outs and local listings
- Original-photo capture and multi-photo selection
- Typed AI boundary with an explicitly labelled deterministic mock
- Editable listing details and asking-price guidance
- Public item, clear-out and seller pages using approximate location only
- Saved listings, offers with counter/accept/decline, and demo conversations
- My Listings and manual sold status
- Safety guidance plus report/block service boundaries
- AsyncStorage persistence and Supabase-ready migrations with RLS foundations

## Transaction boundary

OfferMe facilitates discovery, listings, offers and messages. **There is no in-app payment, escrow, wallet, buyer protection, courier, shipping label, parcel tracking, collection scheduling or home-address sharing.** An accepted offer does not mean a payment or transaction was completed. Buyer and seller arrange payment and handover independently.

## Demo honesty

Profiles, listings, clear-outs, offers and conversations bundled with the app are labelled development data. Local actions do not reach real users. Mock AI returns a deterministic Coffee Machine example; it never claims a provider analysed the photos. Seller photos remain unaltered.

## Stack and run

React Native, Expo SDK 57, TypeScript, Expo Router, AsyncStorage and a Supabase client seam.

```bash
npm install
cp .env.example .env
npm start
```

Use `npm run android`, `npm run ios`, or `npm run web`. No credentials are needed for demo mode.

## Structure

```text
app/                         Discovery, selling, offers and message routes
src/components/              OfferMe UI and image-led listing cards
src/config/                  Regions, currencies and categories
src/data/                    Clearly labelled development marketplace data
src/services/                AI and safety boundaries
src/store/                   Persisted local demo repository
src/types/                   Listing, clear-out, offer and messaging models
supabase/migrations/         Foundation and OfferMe pivot migrations
docs/PRODUCT_ARCHITECTURE.md Privacy, transaction and backend boundaries
assets/branding/             Approved-asset handoff location
```

## Backend work required

Production requires Supabase Auth and Storage, applied/tested migrations, RLS integration tests, repositories, search, private realtime conversations, push notifications, server-authoritative offer transitions, media moderation, abuse prevention, observability, data export/deletion and operational moderation tools. Messages must only be readable by conversation members.

AI requires an authenticated backend/Edge Function, server-held provider credentials, structured-output validation, moderation, rate limits and error handling. Never expose AI or service-role secrets through `EXPO_PUBLIC_*`.

Before public launch implement report review queues, moderator tooling, block enforcement, prohibited-item policies, content review, appeals, fraud/spam detection, retention policies and legal/privacy review. Ratings are deliberately absent.

## Location

Only country, county/region and town/city are public. OfferMe does not request precise GPS and has no public street-address field. “Near you” means the configured broad area, not a measured distance.

## Branding and package status

The original approved OfferMe SVG is stored unchanged in `assets/branding/offerme-logo.svg` and rendered directly throughout the app. Expo icon, adaptive icon, splash and favicon PNGs are proportional canvas renders of that source with clear space; the artwork is not redrawn, recoloured, traced or given a tagline. Regenerate them with `npm run brand:assets`.

The visible name, slug and URL scheme are `OfferMe` / `offerme`. Android intentionally remains `com.designovation.sellr` to avoid casually changing a potentially registered identifier. `com.designovation.offerme` is proposed after ownership and store records are confirmed. No iOS bundle identifier is explicitly set.

## Checks

```bash
npm run typecheck
npm run check
npm run build:web
```
