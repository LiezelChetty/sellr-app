# Marketplace integrations

SELLR follows one non-negotiable rule: a marketplace action is only described as successful after an authorised marketplace integration confirms it.

## Principles

1. Production connections use official integrations only.
2. OAuth/API authorisation is used where an official, approved integration is available.
3. SELLR never requests, handles, or stores marketplace passwords.
4. SELLR does not scrape marketplaces.
5. SELLR does not use browser automation to bypass marketplace restrictions.
6. Connectors are capability-based. UI must check configuration rather than infer functionality from a marketplace name.
7. Marketplace availability is regionally configured in `src/config/marketplaces.ts` and mirrored in the database.
8. Unsupported marketplaces use clearly labelled preparation/handoff: copy/share a draft, then let the user complete listing on the marketplace.
9. Marketplace developer documentation, commercial approval, permissions, rate limits, and terms must be reverified immediately before any production connector is implemented.
10. Direct publishing, syncing, status checks, and delisting must never be shown as successful unless the marketplace actually confirms the operation.

## Capability meanings

| Capability | Meaning |
| --- | --- |
| `PREPARE_ONLY` | SELLR may generate an editable local draft. |
| `HANDOFF` | SELLR may copy/share and open an official user-facing marketplace destination. |
| `OAUTH_AVAILABLE` | Connection architecture may be shown; it is not connected until server OAuth succeeds. |
| `DIRECT_PUBLISH` | Server connector can publish and receives marketplace confirmation. Not enabled in V1. |
| `SYNC` | Server connector can reconcile remote state. Not enabled in V1. |
| `DELIST` | Server connector can remove a remote listing and confirms success. Not enabled in V1. |

## Connector boundary

`MarketplaceConnector` defines connect, disconnect, prepare, publish, update, status, and delist operations. The V1 `MockMarketplaceConnector` permits draft preparation but deliberately throws for live operations. A production connector must live behind a secure server API/Edge Function. OAuth client secrets, refresh tokens, and access tokens must not be stored in the app; the database keeps only a reference to encrypted server-side token storage.

## Current regional configuration

Ireland exposes Vinted, DoneDeal, Facebook Marketplace, and eBay. Entries for the UK, South Africa, United States, and Australia are intentionally conservative starter configurations for expansion, not a claim of API availability.

## Handoff behavior

V1 copies the prepared title, description, price, and tags to the clipboard, explicitly says that nothing was published, and can open a normal marketplace listing page. Users manually mark a listing `LIVE` after they list it themselves. When a sale is recorded, SELLR warns about any remaining listings marked live; it does not claim to remove them.
