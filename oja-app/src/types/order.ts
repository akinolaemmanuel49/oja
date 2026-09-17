export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "cancelled"
  | "failed";

export type StorefrontOrderItem = {
  id: string;
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_label?: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

/**
 * Order as surfaced to storefront staff (order management).
 */
export type StorefrontOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  payment_reference?: string | null;
  payment_gateway?: string | null;
  note?: string | null;
  storefront_id: string;
  storefront_name?: string | null;
  storefront_slug?: string | null;
  items: StorefrontOrderItem[];
};

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "completed",
  "cancelled",
  "failed",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
};