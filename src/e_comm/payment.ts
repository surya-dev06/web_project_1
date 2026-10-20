import { ecommerceSupabase as db } from "../lib/supabase-ecommerce";

type RzpFailure = { error?: { description?: string; reason?: string } };
type RzpInstance = { open: () => void; on: (e: string, cb: (r: RzpFailure) => void) => void };
declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => RzpInstance } }

let scriptPromise: Promise<boolean> | null = null;
function loadScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<boolean>((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => { scriptPromise = null; s.remove(); resolve(false); };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

type FnResult<T> = { data: T | null; message: string };
// supabase-js hides the server's JSON message on non-2xx replies; this reads it so errors are meaningful.
async function callFn<T = Record<string, unknown>>(name: string, body: Record<string, unknown>): Promise<FnResult<T>> {
  if (!db) return { data: null, message: "Store is not connected." };
  const { data, error } = await db.functions.invoke(name, { body });
  if (!error) return { data: data as T, message: "" };
  let message = error.message || "Request failed.";
  const ctx = (error as { context?: unknown }).context;
  if (ctx instanceof Response) {
    try { const j = await ctx.clone().json(); if (j?.error) message = String(j.error); } catch { /* keep default */ }
  }
  console.error(`[${name}]`, message);
  return { data: null, message };
}

type Customer = { name: string; email?: string; phone: string };
type CreateOrderReply = { key_id: string; razorpay_order_id: string; amount: number; currency: string; order_number: string };
type VerifyReply = { status?: "paid" | "failed" | "pending" };

/**
 * Opens Razorpay Checkout for an order already created in the database.
 * `onDone` is called exactly once: ok=true when the server confirmed the payment.
 */
export async function payForOrder(orderId: string, customer: Customer, onDone: (ok: boolean, reason?: string) => void) {
  if (!db) throw new Error("Store is not connected.");
  if (!(await loadScript()) || !window.Razorpay) throw new Error("Could not load Razorpay. Check your connection and try again.");

  const created = await callFn<CreateOrderReply>("razorpay-create-order", { order_id: orderId });
  if (!created.data?.razorpay_order_id) throw new Error(created.message || "Could not start the payment.");
  const o = created.data;

  let finished = false;
  let lastFailure = "";
  const finish = (ok: boolean, reason?: string) => { if (finished) return; finished = true; onDone(ok, reason); };

  const rzp = new window.Razorpay({
    key: o.key_id, amount: o.amount, currency: o.currency, order_id: o.razorpay_order_id,
    name: "NovaShop", description: `Order ${o.order_number}`,
    prefill: { name: customer.name, email: customer.email, contact: customer.phone },
    notes: { order_id: orderId },
    theme: { color: "#7452b8" },
    // handler runs only after Razorpay confirms a successful payment.
    handler: async (r: Record<string, string>) => {
      const res = await callFn<VerifyReply>("razorpay-verify", {
        order_id: orderId,
        razorpay_order_id: r.razorpay_order_id,
        razorpay_payment_id: r.razorpay_payment_id,
        razorpay_signature: r.razorpay_signature,
      });
      if (res.data?.status === "paid") finish(true);
      else finish(false, res.message || "We could not confirm your payment. If money was debited it will be confirmed automatically.");
    },
    modal: {
      confirm_close: true, // asks "Are you sure?" so a stray tap does not cancel the order
      escape: false,
      ondismiss: async () => {
        if (finished) return;
        // Ask the server to check with Razorpay first, then cancel only if nothing was paid.
        const res = await callFn<VerifyReply>("razorpay-verify", { order_id: orderId, action: "cancel" });
        if (res.data?.status === "paid") finish(true);
        else if (res.data?.status === "pending") finish(false, "We are still confirming your payment. If money was debited, your order will be confirmed shortly.");
        else finish(false, lastFailure || "Payment was cancelled.");
      },
    },
  });
  // A failed attempt is NOT final: Razorpay lets the customer retry in the same window. Just remember why.
  rzp.on("payment.failed", (r) => { lastFailure = r?.error?.description || r?.error?.reason || ""; });
  rzp.open();
}
