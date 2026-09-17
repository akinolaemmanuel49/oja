import { useState } from "react";
import { Button, Input, Label, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@oja/ui";
import { Minus, Plus, ShoppingCart, Trash2, User } from "lucide-react";
import { useShop } from "@/hooks/useShop";

export function CartDrawer() {
  const {
    cart,
    cartLoading,
    customer,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    placeOrder,
    setSignInOpen,
    setOrdersOpen,
  } = useShop();

  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const count = items.reduce((n, i) => n + i.quantity, 0) ?? cart?.count ?? 0;

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      if (customer) {
        await placeOrder();
      } else {
        if (!guestEmail || !guestEmail.includes("@")) return;
        await placeOrder({ email: guestEmail, name: guestName || undefined });
      }
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Your Cart
            </span>
            <span className="text-sm font-normal text-gray-500">{count} item{count !== 1 ? "s" : ""}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cartLoading && (
            <div className="text-sm text-gray-500 text-center py-12">Loading cart…</div>
          )}

          {!cartLoading && items.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Your cart is empty</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setCartOpen(false)}
              >
                Continue shopping
              </Button>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex gap-3 py-3 border-b border-gray-100">
              <div className="w-20 h-20 rounded bg-gray-50 overflow-hidden shrink-0">
                {item.main_image_url ? (
                  <img src={item.main_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">—</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.product_name}</p>
                {item.variant_label && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{item.variant_label}</p>
                )}
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ₦{item.unit_price.toLocaleString()}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-50"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    className="w-7 h-7 border rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock_available}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    className="ml-auto p-1 text-gray-400 hover:text-red-500"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <SheetFooter>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-base">₦{subtotal.toLocaleString()}</span>
            </div>

            {!customer && (
              <>
                <div className="space-y-2 mb-1">
                  <Label htmlFor="guest-email" className="text-xs text-gray-500">
                    Email (for your order receipt)
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Name (optional)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                <Button variant="ghost" className="text-blue-600" onClick={() => { setCartOpen(false); setSignInOpen(true); }}>
                  <User className="h-4 w-4 mr-2" /> Sign in for checkout & order history
                </Button>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => clearCart()}>
                Clear
              </Button>
              <Button
                className="flex-1"
                disabled={checkingOut || (!customer && (!guestEmail || !guestEmail.includes("@")))}
                onClick={() => void handleCheckout()}
              >
                {checkingOut ? "Processing…" : "Checkout"}
              </Button>
            </div>

            {customer && (
              <Button variant="ghost" className="text-blue-600" onClick={() => { setCartOpen(false); setOrdersOpen(true); }}>
                My orders
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}