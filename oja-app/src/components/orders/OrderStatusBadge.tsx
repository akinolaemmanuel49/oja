import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types/order";

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
  failed: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`px-2 py-1 rounded text-sm font-medium ${STATUS_BADGE_CLASSES[status] || "bg-gray-100 text-gray-700"}`}
    >
      {ORDER_STATUS_LABELS[status] || status}
    </span>
  );
}