import type { StorefrontStatus } from "@/types/storefront";

/**
 * Request data for creating a storefront
 */
export type CreateStorefrontRequest = {
  slug: string;
  name: string;
  domain?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  favicon?: string;
};

/**
 * Request data for updating a storefront
 */
export type UpdateStorefrontRequest = {
  slug?: string;
  name: string;
  domain?: string;
  status?: StorefrontStatus;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  favicon?: string;
};
