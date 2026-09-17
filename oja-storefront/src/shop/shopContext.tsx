import {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { InternalAxiosRequestConfig } from "axios";
import { toast } from "@oja/ui";
import { ShopContext } from "@/hooks/useShop";
import type { ShopContextValue } from "./types";
import apiClient from "@/api/client";
import {
  addCartItem,
  checkoutOrder,
  clearCart,
  fetchCart,
  fetchMe,
  getDeviceId,
  logout,
  removeCartItem,
  updateCartItem,
} from "./api";
import type { ShopProviderProps } from "./types";

export function ShopProvider({ storefrontSlug, children }: ShopProviderProps) {
  const [storefrontId, setStorefrontId] = useState<string | null>(null);
  const [deviceId] = useState<string>(() => getDeviceId());
  const [cart, setCart] = useState<ShopContextValue["cart"]>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [customer, setCustomer] = useState<ShopContextValue["customer"]>(null);
  const [customerLoading, setCustomerLoading] = useState(true);

  const [isCartOpen, setCartOpen] = useState(false);
  const [isSignInOpen, setSignInOpen] = useState(false);
  const [isOrdersOpen, setOrdersOpen] = useState(false);

  const resolveStorefrontId = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ id: string }>(
        `/storefronts/resolve/${storefrontSlug}`,
      );
      setStorefrontId(data.id);
      return data.id;
    } catch {
      setStorefrontId(null);
      return null;
    }
  }, [storefrontSlug]);

  const attachDeviceId = useCallback(
    (config: InternalAxiosRequestConfig) => {
      config.headers.set("X-Device-Id", deviceId);
      return config;
    },
    [deviceId],
  );

  useEffect(() => {
    apiClient.interceptors.request.use(attachDeviceId);
  }, [attachDeviceId]);

  // Bootstrap: storefront id, session, cart
  useEffect(() => {
    if (!storefrontId) return;
    let active = true;

    (async () => {
      const [me, loadedCart] = await Promise.all([fetchMe(), fetchCart(storefrontId)]);
      if (!active) return;
      setCustomer(me);
      setCustomerLoading(false);
      setCart(loadedCart);
      setCartLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [storefrontId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void resolveStorefrontId();
  }, [resolveStorefrontId]);

  const refreshCart = useCallback(async () => {
    if (!storefrontId) return;
    try {
      const loaded = await fetchCart(storefrontId);
      setCart(loaded);
    } catch {
      // silent — cart just stays as-is
    }
  }, [storefrontId]);

  const refreshCustomer = useCallback(async () => {
    const me = await fetchMe();
    setCustomer(me);
    setCustomerLoading(false);
  }, []);

  const addItem = useCallback(
    async (productId: string, variantId?: string | null, quantity = 1) => {
      if (!storefrontId) {
        toast.error("Store is still loading, please try again.");
        return;
      }
      try {
        const updated = await addCartItem(storefrontId, {
          product_id: productId,
          variant_id: variantId ?? null,
          quantity,
        });
        setCart(updated);
        toast.success("Added to cart");
        setCartOpen(true);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "Could not add to cart";
        toast.error(String(message));
      }
    },
    [storefrontId],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!storefrontId) return;
      try {
        const updated = await updateCartItem(storefrontId, itemId, quantity);
        setCart(updated);
      } catch {
        await refreshCart();
      }
    },
    [storefrontId, refreshCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!storefrontId) return;
      const updated = await removeCartItem(storefrontId, itemId);
      setCart(updated);
    },
    [storefrontId],
  );

  const clearCartAction = useCallback(async () => {
    if (!storefrontId) return;
    const updated = await clearCart(storefrontId);
    setCart(updated);
  }, [storefrontId]);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setCustomer(null);
      await refreshCart();
    }
  }, [refreshCart]);

  const placeOrder = useCallback(
    async (guest?: { email: string; name?: string }) => {
      if (!storefrontId) return;
      try {
        const result = await checkoutOrder(storefrontId, guest);

        if (result.authorization_url) {
          window.location.href = result.authorization_url;
          return;
        }

        // Development mock — payment auto-succeeds.
        toast.success(`Order ${result.order_number} confirmed`);
        await refreshCart();
        if (customer) {
          setCartOpen(false);
          setOrdersOpen(true);
        } else {
          setCartOpen(false);
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "Checkout failed";
        toast.error(String(message));
      }
    },
    [storefrontId, refreshCart, customer],
  );

  const value: ShopContextValue = {
    storefrontId,
    deviceId,
    cart,
    cartLoading,
    customer,
    customerLoading,
    isCartOpen,
    setCartOpen,
    isSignInOpen,
    setSignInOpen,
    isOrdersOpen,
    setOrdersOpen,
    refreshCart,
    refreshCustomer,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: clearCartAction,
    signOut,
    placeOrder,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}