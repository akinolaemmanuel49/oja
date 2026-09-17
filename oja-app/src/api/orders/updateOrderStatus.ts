import apiClient from "../client";
import type { UpdateOrderStatusRequest } from "@/requests/order";
import type { StorefrontOrder } from "@/types/order";

export const updateOrderStatus = async (
  orderId: string,
  update: UpdateOrderStatusRequest,
): Promise<StorefrontOrder> => {
  const { data } = await apiClient.patch<StorefrontOrder>(
    `/orders/manage/${orderId}`,
    update,
  );

  return data;
};

type UpdateOrderStatusMutationFnParams = {
  orderId: string;
  update: UpdateOrderStatusRequest;
  onSuccess?: () => void;
};

export const UpdateOrderStatusMutationFn = async ({
  orderId,
  update,
  onSuccess,
}: UpdateOrderStatusMutationFnParams) => {
  const result = await updateOrderStatus(orderId, update);
  onSuccess?.();
  return result;
};