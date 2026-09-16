import type { StorefrontStatus } from "@/types/storefront";

/**
 * Request data for creating a storefront
 */
export type CreateStorefrontRequest = {
  slug: string;
  name: string;
  domain?: string;
};

/**
 * Request data for updating a storefront
 */
export type UpdateStorefrontRequest = {
  slug?: string;
  name: string;
  domain?: string;
  status?: StorefrontStatus;
};
