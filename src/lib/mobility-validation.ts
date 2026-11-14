/**
 * Mobility & Industrial Hub — Phase 2 infrastructure flags only.
 * The concept (marketplace, rental, contracts, payments, tracking, roadside,
 * tenders/auctions, government asset gateway, taxi registry) is a transactional
 * product and is NOT a Phase 1 section. All flags are stored disabled and no
 * code path may read them to enable behaviour. No tables or columns exist for
 * listings, offers, contracts, payments, vehicles, plates, chassis numbers,
 * owners, locations or tracking.
 */
export const MOBILITY_PHASE2_FLAGS = [
  "mobility_marketplace_listings",
  "mobility_rfq",
  "mobility_rental_operations",
  "mobility_contracts_esignature",
  "mobility_payments_escrow",
  "mobility_financed_asset_settlement",
  "mobility_inspection_booking",
  "mobility_vehicle_tracking",
  "mobility_roadside_dispatch",
  "mobility_tenders_auctions",
  "mobility_gov_asset_gateway",
  "mobility_taxi_registry",
  "mobility_mobile_app",
] as const;
