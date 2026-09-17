import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Card,CardContent,CardDescription,CardHeader,CardTitle,Label,Select,SelectContent,SelectItem,SelectTrigger,SelectValue,Textarea } from "@oja/ui";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { fetchStorefrontOrder } from "@/api/orders/fetchStorefrontOrder";
import { UpdateOrderStatusMutationFn } from "@/api/orders/updateOrderStatus";
import type { OrderStatus } from "@/types/order";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/types/order";
import { AppLoader } from "@/components/loaders/AppLoader";
import { FadeUp } from "@oja/motion-design";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

const FINAL_STATUSES: OrderStatus[] = ["completed", "cancelled", "failed"];

export default function StorefrontOrderDetail() {
  const { storeId, orderId } = useParams<{ storeId: string; orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storefront-order", orderId!],
    queryFn: fetchStorefrontOrder,
    enabled: !!orderId,
  });

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: UpdateOrderStatusMutationFn,
    onSuccess: () => {
      setSelectedStatus(null);
      setNoteDraft("");
      queryClient.invalidateQueries({ queryKey: ["storefront-order", orderId!] });
      queryClient.invalidateQueries({ queryKey: ["storefront-orders"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    if (!order) return;
    updateMutation.mutate({
      orderId: order.id,
      update: {
        status: selectedStatus ?? order.status,
        note: noteDraft || order.note || "",
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text="Loading order" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center">
        <p className="text-red-500">
          {error ? (error as Error).message : "Order not found"}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate(`/storefronts/${storeId}/orders`)}
          className="mt-4 hover:cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    );
  }

  const canChangeStatus = !FINAL_STATUSES.includes(order.status);

  const displayedStatus = selectedStatus ?? order.status;
  const displayedNote = noteDraft || order.note || "";
  const isDirty =
    displayedStatus !== order.status || displayedNote !== (order.note || "");

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 px-4">
      <FadeUp>
        <Button
          variant="ghost"
          onClick={() => navigate(`/storefronts/${storeId}/orders`)}
          className="mb-2 hover:cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order {order.order_number}
            </h1>
            <p className="text-gray-600 mt-1">
              {order.storefront_name} • {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <Card className="ring-1 ring-black/5 shadow-sm">
          <CardHeader>
            <CardTitle>Customer &amp; Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span>{order.customer_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span>{order.customer_email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment reference</span>
              <span>{order.payment_reference || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gateway</span>
              <span>{order.payment_gateway || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-medium">
                {order.currency} {order.total.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="ring-1 ring-black/5 shadow-sm">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            {order.items.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-gray-600">Product</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-600">Variant</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-600">Qty</th>
                    <th className="text-right py-2 pl-4 font-medium text-gray-600">Price</th>
                    <th className="text-right py-2 pl-4 font-medium text-gray-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{item.product_name}</td>
                      <td className="py-2 px-4 text-gray-500">{item.variant_label || "—"}</td>
                      <td className="py-2 px-4">{item.quantity}</td>
                      <td className="py-2 text-right">{item.unit_price.toLocaleString()}</td>
                      <td className="py-2 text-right">{item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No line items</p>
            )}
          </CardContent>
        </Card>
      </FadeUp>

      <FadeUp delay={0.15}>
        <Card className="ring-1 ring-black/5 shadow-sm">
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>
              {canChangeStatus
                ? "Changing the status notifies the customer by email."
                : "This order is in a final state and its status can no longer be changed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={displayedStatus}
                onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
                disabled={!canChangeStatus || updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={displayedNote}
                rows={2}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Shown to the customer in the status email"
                disabled={updateMutation.isPending}
              />
            </div>

            {saved && (
              <p className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Order updated
              </p>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={
                  !canChangeStatus || updateMutation.isPending || !isDirty
                }
                className="hover:cursor-pointer"
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Status
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/storefronts/${storeId}/orders`)}
                className="hover:cursor-pointer"
              >
                Cancel
              </Button>
            </div>
            {updateMutation.isError && (
              <p className="text-sm text-red-500">
                Failed to update order:{" "}
                {(updateMutation.error as Error).message}
              </p>
            )}
          </CardContent>
        </Card>
      </FadeUp>
    </div>
  );
}