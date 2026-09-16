# OfferMe backend foundation

OfferMe supports two explicit runtime modes:

- **Demo mode** is used when Supabase variables are absent or `EXPO_PUBLIC_DEMO_MODE=true`. Regional development listings and local device state remain available.
- **Supabase mode** is used when the URL and publishable/anon key are present and demo mode is not enabled. Authenticated database, Storage and Realtime paths are used; demo listings are not mixed into production discovery.

Copy `.env.example` to a local `.env`, set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and set `EXPO_PUBLIC_DEMO_MODE=false`. Never place a service-role key, database password or third-party secret in an `EXPO_PUBLIC_*` variable.

## Project setup

1. Create a Supabase project and keep email/password Auth enabled. Decide whether email confirmation is required for the release environment.
2. In Auth URL Configuration, set the production Site URL and add the installed-app recovery redirect URL when the reset-password completion screen is implemented. Do not disable email confirmation merely to simplify development.
3. Install/sign in to the Supabase CLI, then from this repository run `supabase link --project-ref YOUR_PROJECT_REF` and `supabase db push`. Review the migration plan before confirming the push.
4. Confirm that the `listing-photos` bucket exists and is public. The migration creates it with a 10 MB per-file limit and image MIME allow-list; owner-scoped write policies protect it.
5. In the local uncommitted `.env`, set the project URL and publishable key from Project Settings → API, then set `EXPO_PUBLIC_DEMO_MODE=false`. The legacy anon key remains supported, but the publishable key is preferred.
6. Create two email/password test accounts, complete broad-location onboarding for both, and execute the two-user acceptance checklist before release.

Apply migrations in filename order with the Supabase CLI. The production-hardening migration adds broad location fields and indexes, creates the `listing-photos` bucket, provisions profiles after Auth signup, removes direct conversation membership creation, and removes direct offer updates. `start_listing_conversation` derives the seller from the listing. `transition_offer` is the authoritative state-transition boundary and validates the authenticated party and previous state. Both exposed functions pin an empty `search_path`, schema-qualify relations, revoke public/anonymous execution and grant only authenticated execution.

RLS boundaries:

- Public marketplace reads are limited to live listings, live clear-outs and deliberately public profile fields. Email remains only in `auth.users` and is never selected by marketplace clients.
- A seller owns listing, photo and clear-out writes. Storage writes are restricted to the authenticated user's first path segment.
- Favourites, reports and blocks are private to their creator.
- Offers are visible only to buyer and seller. The buyer can create a valid offer against the listing's actual seller; later transitions go through the RPC.
- Conversations, participant rows and messages are visible only to members. Membership is created atomically by the RPC.

Current release boundaries:

- OfferMe does not process payments, escrow, buyer protection, courier booking or handover verification.
- Location is country + region/state/province/county + town/city only. No coordinates, street address or precise distance is stored or shown.
- Listing analysis remains a clearly labelled simulated client suggestion. Production AI credentials and inference still require a server/Edge Function.
- Email/password Auth, profile onboarding, listing photos, discovery, favourites, offers, messages, clear-outs and reports have production code paths. A configured Supabase project is required for end-to-end integration testing.
- Password reset email dispatch is wired to Supabase Auth. A polished in-app recovery/deep-link completion screen and verified production email templates remain release work.
- Moderation review tooling, account deletion/export, notification delivery, abuse throttling, observability and production backup/restore exercises remain release work.
