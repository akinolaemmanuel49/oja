import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@oja/ui";
import { Package, PackageOpen } from "lucide-react";
import { fetchAllOrders, fetchOrders } from "./api";
import { useShop } from "@/hooks/useShop";
import type { OrderOut } from "./types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderRow({ order }: { order: OrderOut }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-gray-900">{order.order_number}</span>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            order.status === "paid"
              ? "bg-green-50 text-green-700"
              : order.status === "pending"
                ? "bg-amber-50 text-amber-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {order.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
      <ul className="mt-2 space-y-1">
        {order.items.map((item) => (
          <li key={item.id} className="text-sm text-gray-700 flex justify-between gap-2">
            <span className="truncate">
              {item.quantity}× {item.product_name}
            </span>
            <span className="shrink-0">₦{item.subtotal.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-semibold text-gray-900 mt-2 text-right">
        Total: ₦{order.total.toLocaleString()}
      </p>
    </div>
  );
}

export function OrdersDialog() {
  const { storefrontId, isOrdersOpen, setOrdersOpen, customer } = useShop();
  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOrdersOpen || !storefrontId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const storeOrders = await fetchOrders(storefrontId).catch(() => [] as OrderOut[]);
      let all: OrderOut[] = storeOrders;
      if (customer?.platform_customer) {
        const allOrders = await fetchAllOrders().catch(() => [] as OrderOut[]);
        if (allOrders.length) {
          all = allOrders;
        }
      }
      if (active) {
        setOrders(all);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isOrdersOpen, storefrontId, customer?.platform_customer]);

  return (
    <Sheet open={isOrdersOpen} onOpenChange={setOrdersOpen}>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> My Orders
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {loading && (
            <div className="text-sm text-gray-500 text-center py-12">Loading orders…</div>
          )}
          {!loading && orders.length === 0 && (
            <div className="text-center py-16">
              <PackageOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          )}
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}