import type { StorefrontDesign } from "./storefront.design";

export type StorefrontStatus = "active" | "inactive";

/**
 * Storefront type - represents a storefront
 */
export type Storefront = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  slug_updated_at?: string;
  domain?: string;
  design_config?: StorefrontDesign;
  status: StorefrontStatus;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
};
