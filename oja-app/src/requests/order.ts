import type { OrderStatus } from "@/types/order";

/**
 * Request data for updating an order's status.
 */
export type UpdateOrderStatusRequest = {
  status: OrderStatus;
  note?: string;
};