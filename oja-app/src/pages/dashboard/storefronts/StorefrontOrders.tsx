import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Card,CardContent,CardDescription,CardHeader,CardTitle,Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@oja/ui";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { fetchStorefrontOrders } from "@/api/orders/fetchStorefrontOrders";
import { fetchStorefront } from "@/api/storefronts/fetchStorefront";
import type { OrderStatus } from "@/types/order";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/types/order";
import { AppLoader } from "@/components/loaders/AppLoader";
import { FadeUp } from "@oja/motion-design";
import { motion } from "motion/react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export default function StorefrontOrders() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const { data: storefront } = useQuery({
    queryKey: ["storefronts", storeId!],
    queryFn: fetchStorefront,
    enabled: !!storeId,
  });

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storefront-orders", storeId!, statusFilter === "all" ? undefined : statusFilter],
    queryFn: fetchStorefrontOrders,
    enabled: !!storeId,
  });

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [orders],
  );

  const handleViewOrder = (orderId: string) =>
    navigate(`/storefronts/${storeId}/orders/${orderId}`);

  return (
    <div className="space-y-6">
      <FadeUp>
        <Button
          variant="ghost"
          onClick={() => navigate("/storefronts")}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Storefronts
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-gray-600 mt-1">
              {storefront ? `Orders for "${storefront.name}"` : "Storefront orders"}
            </p>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="ring-1 ring-black/5 shadow-sm">
          <CardHeader>
            <CardTitle>Orders ({orders.length})</CardTitle>
            <CardDescription>
              Manage and update the status of customer orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <AppLoader text="Loading orders" />
              </div>
            ) : error ? (
              <p className="text-red-500">
                Error loading orders: {(error as Error).message}
              </p>
            ) : sortedOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Order</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrders.map((order, i) => (
                      <motion.tr
                        key={order.id}
                        className="border-b hover:bg-gray-50/80"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, type: "spring", damping: 25, stiffness: 300 }}
                      >
                        <td className="py-3 px-4 font-medium">{order.order_number}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {order.customer_name || order.customer_email || "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {order.currency} {order.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order.id)}
                              title="View order"
                              className="hover:cursor-pointer"
                            >
                              <ReceiptText className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ReceiptText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeUp>
    </div>
  );
}