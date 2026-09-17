import apiClient from "@/api/client";
import type {
  CartOut,
  CheckoutResult,
  CustomerMe,
  OrderOut,
} from "./types";

/**
 * Persist a per-device UUID so guests keep one cart per browser/device.
 * The id is also mirrored to a `device_id` cookie so the dashboard's
 * designer preview (localhost:5173) shares the same guest cart.
 */
export function getDeviceId(): string {
  const KEY = "oja_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  try {
    document.cookie = `device_id=${id}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  } catch {
    // cookies may be blocked; the header path still works
  }
  return id;
}

export async function fetchMe(): Promise<CustomerMe | null> {
  try {
    const { data } = await apiClient.get<CustomerMe>("/customers/me");
    return data;
  } catch {
    return null;
  }
}

export async function sendCode(storefrontId: string, email: string) {
  await apiClient.post("/customers/send-code", { storefront_id: storefrontId, email });
}

export async function verifyCode(input: {
  storefrontId: string;
  email: string;
  code: string;
  rememberMe: boolean;
  createPlatformAccount: boolean;
}): Promise<CustomerMe> {
  const { data } = await apiClient.post<CustomerMe>("/customers/verify-code", {
    storefront_id: input.storefrontId,
    email: input.email,
    code: input.code,
    remember_me: input.rememberMe,
    create_platform_account: input.createPlatformAccount,
  });
  return data;
}

export async function logout() {
  await apiClient.post("/customers/logout");
}

export async function fetchCart(storefrontId: string): Promise<CartOut> {
  const { data } = await apiClient.get<CartOut>("/carts", {
    params: { storefront_id: storefrontId },
  });
  return data;
}

export async function addCartItem(
  storefrontId: string,
  input: { product_id: string; variant_id?: string | null; quantity?: number },
): Promise<CartOut> {
  const { data } = await apiClient.post<CartOut>("/carts/items", input, {
    params: { storefront_id: storefrontId },
  });
  return data;
}

export async function updateCartItem(
  storefrontId: string,
  itemId: string,
  quantity: number,
): Promise<CartOut> {
  const { data } = await apiClient.patch<CartOut>(`/carts/items/${itemId}`, { quantity }, {
    params: { storefront_id: storefrontId },
  });
  return data;
}

export async function removeCartItem(
  storefrontId: string,
  itemId: string,
): Promise<CartOut> {
  const { data } = await apiClient.delete<CartOut>(`/carts/items/${itemId}`, {
    params: { storefront_id: storefrontId },
  });
  return data;
}

export async function clearCart(storefrontId: string): Promise<CartOut> {
  const { data } = await apiClient.delete<CartOut>("/carts", {
    params: { storefront_id: storefrontId },
  });
  return data;
}

export async function checkoutOrder(
  storefrontId: string,
  guest?: { email: string; name?: string },
): Promise<CheckoutResult> {
  const { data } = await apiClient.post<CheckoutResult>(
    "/orders/checkout",
    guest ?? null,
    { params: { storefront_id: storefrontId } },
  );
  return data;
}

export async function verifyOrder(reference: string) {
  const { data } = await apiClient.post("/orders/verify", { reference });
  return data;
}

export async function fetchOrders(storefrontId: string): Promise<OrderOut[]> {
  const { data } = await apiClient.get<OrderOut[]>("/orders", {
    params: { storefront_id: storefrontId },
  });
  return data;
}

export async function fetchAllOrders(): Promise<OrderOut[]> {
  const { data } = await apiClient.get<OrderOut[]>("/orders/all");
  return data;
}