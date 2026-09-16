# OfferMe product architecture

OfferMe is an AI-assisted local classifieds marketplace built around the feel of an online garage sale. The marketplace itself owns listings, discovery, offers and conversation surfaces. It does not publish to external marketplaces.

## Domain language

- `Listing`: one item offered by a seller. Public data contains only an approximate town/county location.
- `ClearoutSale`: a public collection of listings such as “Moving Sale”. The database table is `clearout_sales` to avoid ambiguity.
- `CompletedSale`: a seller-recorded outcome. The database table is `completed_sales`; this is not proof of payment.
- `Offer`: a negotiation record. `listing_ids` is an array so future bundle offers can reference multiple listings. The current UI creates one-listing offers only.
- `Conversation`: a private thread tied optionally to a listing and/or offer. Members are explicit and messages must never be publicly readable.
- `Favourite`, `Report`, and `BlockedUser`: private user safety/utility data.

## Transaction boundary

OfferMe facilitates discovery, listings, offers and messaging. It has no wallet, payment processing, escrow, buyer protection, courier, shipping label, collection scheduling, parcel tracking or address-sharing feature. An accepted offer means both parties should continue the conversation. Buyer and seller arrange payment and handover independently.

## AI boundary

The mobile app depends on a typed `ItemAnalysisService`. Development uses clearly labelled deterministic mock analysis. Production analysis must be implemented behind an authenticated server or Edge Function with credentials, schema validation, moderation, rate limits and observability. Original seller photos must be preserved and their physical appearance must not be generatively altered.

## Location and privacy

Only country, county/region and town/city belong in public discovery data. No public listing or seller profile field supports a street address, exact coordinates, email address or telephone number. Any later proximity feature needs consent, coarse-grained storage and a documented privacy review.

Location choices are configuration-driven in `src/config/regions.ts`. Each launch country defines its currency, region terminology, regions and a replaceable V1 list of major population centres. The United States configuration covers all 50 states plus Washington, D.C. Onboarding and Profile settings share the same dependent selector, and `formatApproximateLocation` produces public town/region labels without coordinates.

## Safety and moderation

The types and schema support reporting listings/users and blocking users. Before public launch, implement authenticated submission, evidence retention rules, moderator tooling, appeal flows, abuse/rate limiting, prohibited-item policy enforcement, message safety, user data export/deletion and emergency escalation procedures. Ratings are deliberately absent.

## Local demo versus production

Seed listings, profiles, offers and messages are labelled demo data. Local actions persist through AsyncStorage and reach no other person. Production requires Supabase Auth, Storage, RLS-tested repositories, realtime conversations, push notifications, server-side moderation, media processing, search and operational monitoring.

Regional development data is generated from the configured country, region and town. Changing location rebuilds demo listings, seller profiles, clear-outs, offers and currencies for that broad area, while preserving non-demo local activity. Home and Browse only treat content in the configured region as “near you”; the development data is explicitly labelled in the UI.
