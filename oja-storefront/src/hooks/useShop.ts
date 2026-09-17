import { createContext, useContext } from "react";
import type { ShopContextValue } from "@/shop/types";

export const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within <ShopProvider>");
  return ctx;
}