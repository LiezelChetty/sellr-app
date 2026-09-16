# SELLR

SELLR is Designovation's mobile-first selling assistant: **One item. Every marketplace.** A seller photographs an item once, reviews one canonical Master Listing, and prepares editable marketplace-specific drafts for the places relevant to their country.

This repository is the production-quality V1 foundation. It intentionally does not scrape, automate unsupported marketplaces, collect marketplace passwords, fake OAuth, or claim to publish/delist anything.

## Stack

- React Native + Expo 57 + TypeScript
- Expo Router
- AsyncStorage-backed local demo state
- Supabase client boundary and SQL migration with RLS
- Android first; iOS and web compatible

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Use `npm run android`, `npm run ios`, or `npm run web`. No environment variables are required for demo mode.

## Architecture

```text
app/                         Expo Router screens and tabs
  (tabs)/                    Home, My Items, Sell, Insights, Profile
  item/[id].tsx              Master listing, drafts, live/sold workflow
src/
  components/                Shared mobile UI primitives
  config/                    Central marketplace regions and plan pricing
  lib/                       Optional Supabase client
  services/                  AI and marketplace connector boundaries
  store/                     Persisted demo application state
  types/                     Domain models
supabase/migrations/         Database schema, seed configuration, RLS
docs/MARKETPLACE_INTEGRATIONS.md
assets/branding/             Placeholder-brand guidance only
```

`MasterListing` holds canonical item information. Each `MarketplaceListing` references it and may be edited independently. Regional marketplace availability and pricing are central configuration, never scattered through screens.

## Demo mode

The complete local journey works without accounts: onboarding, manual region selection, camera/library photos, clearly labelled mock analysis, editable review, multi-marketplace drafts, copy/open handoff, manual `LIVE` status, sale recording, remaining-live warnings, earnings, accounts, and plan screens. Data persists on the device.

Mocked:

- AI analysis returns the documented Nike Air Max 270 example after a short local delay.
- Marketplace connection states are explicitly development-only and not connected.
- Marketplace drafts are generated locally.
- Authentication, notifications, policies, and billing destinations are placeholders.

## Environment variables

Only the public Supabase project URL and anonymous key may be exposed in Expo. Never put service-role keys, AI secrets, OAuth client secrets, or marketplace tokens in `EXPO_PUBLIC_*`. If Supabase values are absent, the app uses local demo storage.

## Backend and external requirements

Supabase work still required: provision a project, apply the migration, configure Auth/Storage, build server-side OAuth/token encryption, replace the local repository, add Edge Functions, and add production audit/error handling.

AI work still required: deploy a secure backend/Edge Function, choose a provider, validate structured output, implement rate limits/credits and failure handling, and store provider credentials only server-side.

Marketplace work requires each marketplace's current developer terms, approval, credentials, scopes, sandbox testing, and an official API supporting the requested operation. Until then, SELLR remains preparation/handoff only. See [marketplace integration principles](docs/MARKETPLACE_INTEGRATIONS.md).

Billing requires App Store / Google Play configuration and a production purchase service. Indicative prices are provisional and centralized in `src/config/plans.ts`.

## Known limitations

- V1 data and selected photo URIs are local to one device; photos are not uploaded.
- Mock analysis always returns the same demo item and EUR-like example numbers, while the region symbol changes.
- Handoff destinations may change; they must be checked before release.
- No real auth, cloud sync, marketplace publishing/status/delisting, push notifications, purchases, or AI call is enabled.
- Automated E2E/device tests are not yet included.

## Quality checks

```bash
npm run typecheck
npm run check
npm run build:web
```
