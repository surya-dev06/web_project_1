import { useCallback, useEffect, useState } from "react";
import type { CartItem, MenuItem } from "../types";
const KEY = "pp-cart";
const read = (): CartItem[] => { try { return JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch { return []; } };
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(read);
  useEffect(() => {
    const sync = () => setCart(read());
    window.addEventListener("pp-cart", sync);
    window.addEventListener("focus", sync);
    return () => { window.removeEventListener("pp-cart", sync); window.removeEventListener("focus", sync); };
  }, []);
  const add = useCallback((d: MenuItem) => {
    const cur = read();
    const next = cur.some((x) => x.id === d.id) ? cur.map((x) => (x.id === d.id ? { ...x, quantity: x.quantity + 1 } : x)) : [...cur, { ...d, quantity: 1 }];
    sessionStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("pp-cart"));
  }, []);
  return { cart, add, count: cart.reduce((s, x) => s + x.quantity, 0), total: cart.reduce((s, x) => s + x.price * x.quantity, 0) };
}
export const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
