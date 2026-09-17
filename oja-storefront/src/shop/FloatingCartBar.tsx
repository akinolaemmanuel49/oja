import { ShoppingCart, User } from "lucide-react";
import { useShop } from "@/hooks/useShop";

/**
 * Floating action buttons (bottom-right) for cart + account.
 * The account button opens order history when signed in, otherwise sign-in.
 */
export function FloatingCartBar() {
  const {
    cart,
    customer,
    setCartOpen,
    setSignInOpen,
    setOrdersOpen,
  } = useShop();

  const count = (cart?.items ?? []).reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex flex-col gap-3">
      <button
        onClick={() => (customer ? setOrdersOpen(true) : setSignInOpen(true))}
        className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
        aria-label={customer ? "My orders" : "Sign in"}
        title={customer ? customer.customer.email : "Sign in"}
      >
        <User className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCartOpen(true)}
        className="relative w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-[11px] font-bold flex items-center justify-center">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
    </div>
  );
}