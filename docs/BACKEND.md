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
- Demo mode uses a clearly labelled deterministic manual draft and does not claim to inspect photographs. Backend mode invokes the deployed vision Edge Function; it falls back to manual entry until its server-only provider secret is configured.
- Email/password Auth, profile onboarding, listing photos, discovery, favourites, offers, messages, clear-outs and reports have production code paths. A configured Supabase project is required for end-to-end integration testing.
- Password reset email dispatch is wired to Supabase Auth. A polished in-app recovery/deep-link completion screen and verified production email templates remain release work.
- Moderation review tooling, account deletion/export, notification delivery, abuse throttling, observability and production backup/restore exercises remain release work.

## AI-assisted listing drafts

The production path is `Expo client → authenticated Supabase Edge Function → OpenAI Responses API → validated structured draft → seller review`. The function is named `analyze-listing`. The Expo app sends up to six base64-encoded analysis copies of the seller's selected photos through `supabase.functions.invoke`; the original photo URIs and uploaded Storage objects are not modified.

The Edge Function independently validates the user JWT, reads the account's country to select its currency, validates MIME types and size limits, atomically claims an hourly quota, and then sends the actual images to a vision-capable model. `verify_jwt` must remain enabled. Requests accept JPEG, PNG or WebP images, at most 6 MB each and 20 MB total. The provider request has a 25-second timeout and `store: false`.

The required server-only secret is `OPENAI_API_KEY`. `OPENAI_VISION_MODEL` is optional and defaults to `gpt-4o-mini`. Neither belongs in the Expo `.env` or any `EXPO_PUBLIC_*` variable. Configure and deploy with:

```bash
supabase secrets set OPENAI_API_KEY=YOUR_KEY
supabase secrets set OPENAI_VISION_MODEL=gpt-4o-mini
supabase db push --linked
supabase functions deploy analyze-listing --use-api
```

For local function development, copy `supabase/functions/.env.example` to the ignored `supabase/functions/.env`, then use `supabase functions serve analyze-listing --env-file supabase/functions/.env`. Never commit that local file.

The returned `analysis` object is constrained and revalidated server-side:

```json
{
  "title": "string",
  "category": "Home | Kids | Fashion | Electronics | Garden | Sports | Other",
  "condition": "New | Like new | Good | Fair | For parts",
  "description": "string",
  "suggestedPrice": "number | null",
  "currency": "the signed-in user's regional currency",
  "brand": "string | null",
  "confidence": "number from 0 to 1",
  "warnings": ["string"]
}
```

The prompt treats multiple photos as views of one item, forbids unsupported brand/model/functionality claims, requests conservative descriptions, and distinguishes an AI estimate from market-comparable pricing. The client keeps review and editing mandatory. Low-confidence results display a friendly warning. Provider failure, timeout, invalid output, unsupported media or missing server configuration moves the seller into the normal manual editor instead of blocking listing creation.

Cost controls currently comprise authenticated-only invocation, 10 analyses per user per rolling hour, six-image and byte limits, MIME validation, a provider timeout, bounded structured output, and sanitized client errors. Before a larger launch, add project-level OpenAI spend alerts, Supabase function monitoring, abuse analytics and evaluation datasets covering varied items, lighting, damage and ambiguous branding.

### AI acceptance testing

Use two authenticated test accounts in a non-production release channel. Test one and multiple views of generic drinkware, furniture, toys, footwear, appliances and electronics; include unbranded, visibly damaged and ambiguous items. Confirm that brands/models are omitted unless visible, electronics are not claimed working, warnings appear for uncertainty, all fields remain editable, the original files are unchanged, and manual entry works with the provider secret temporarily absent. AI image interpretation is probabilistic, so these are evaluation cases—not hardcoded title mappings.
