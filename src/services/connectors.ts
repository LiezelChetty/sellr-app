import { Marketplace, MarketplaceListing } from "../types/domain";

export interface MarketplaceConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  prepareListing(listing: MarketplaceListing): Promise<MarketplaceListing>;
  publishListing(listing: MarketplaceListing): Promise<never>;
  updateListing(listing: MarketplaceListing): Promise<never>;
  getListingStatus(): Promise<"UNAVAILABLE">;
  delist(): Promise<never>;
}
export class MockMarketplaceConnector implements MarketplaceConnector {
  constructor(private marketplace: Marketplace) {}
  async connect() {
    throw new Error(
      `${this.marketplace.name} connection is not implemented. This is development architecture only.`,
    );
  }
  async disconnect() {
    return;
  }
  async prepareListing(listing: MarketplaceListing) {
    return listing;
  }
  async publishListing(): Promise<never> {
    throw new Error(
      "Direct publishing is unavailable. Use the clearly labelled handoff flow.",
    );
  }
  async updateListing(): Promise<never> {
    throw new Error("Marketplace sync is unavailable.");
  }
  async getListingStatus() {
    return "UNAVAILABLE" as const;
  }
  async delist(): Promise<never> {
    throw new Error("Automatic delisting is unavailable.");
  }
}
