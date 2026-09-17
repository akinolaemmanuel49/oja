import type { ReactNode } from "react";

export interface CartItemOut {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_label?: string | null;
  main_image_url?: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  stock_available: number;
}

export interface CartOut {
  cart_id: string | null;
  storefront_id: string;
  status: string;
  items: CartItemOut[];
  count: number;
  subtotal: number;
  currency: string;
}

export interface CustomerOut {
  id: string;
  storefront_id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}

export interface PlatformCustomerOut {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}

export interface CustomerMe {
  customer: CustomerOut;
  platform_customer?: PlatformCustomerOut | null;
}

export interface OrderItemOut {
  id: string;
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_label?: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderOut {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  created_at: string;
  items: OrderItemOut[];
  storefront_slug?: string;
  storefront_name?: string;
}

export interface CheckoutResult {
  order_id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  authorization_url?: string | null;
  reference?: string | null;
}

export interface ShopContextValue {
  storefrontId: string | null;
  deviceId: string;
  cart: CartOut | null;
  cartLoading: boolean;
  customer: CustomerMe | null;
  customerLoading: boolean;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isSignInOpen: boolean;
  setSignInOpen: (open: boolean) => void;
  isOrdersOpen: boolean;
  setOrdersOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  addItem: (
    productId: string,
    variantId?: string | null,
    quantity?: number,
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  signOut: () => Promise<void>;
  placeOrder: (guest?: { email: string; name?: string }) => Promise<void>;
  }

export interface ShopProviderProps {
  storefrontSlug: string;
  children: ReactNode;
}