import type { UpdateStorefrontRequest } from "@/requests/storefront";
import type { Storefront } from "@/types/storefront";
import apiClient from "../client";

export const updateStorefront = async (
  storefrontId: string,
  storefrontData: UpdateStorefrontRequest,
): Promise<Storefront> => {
  const { data } = await apiClient.patch(
    `/storefronts/${storefrontId}`,
    storefrontData,
  );

  return data;
};

type UpdateStorefrontMutationFnParams = {
  storefrontId: string;
  storefrontUpdate: UpdateStorefrontRequest;
};

export const UpdateStorefrontMutationFn = async ({
  storefrontId,
  storefrontUpdate,
}: UpdateStorefrontMutationFnParams) =>
  updateStorefront(storefrontId, storefrontUpdate);
