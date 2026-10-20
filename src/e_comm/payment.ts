import { ecommerceSupabase as db } from "../lib/supabase-ecommerce";

declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void } } }

function loadScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Customer = { name: string; email?: string; phone: string };
// Opens Razorpay Checkout for an order already created in the database.
export async function payForOrder(orderId: string, customer: Customer, onDone: (ok: boolean) => void) {
  if (!db) throw new Error("Store is not connected.");
  const client = db;
  if (!(await loadScript())) throw new Error("Could not load Razorpay. Check your connection.");
  const { data, error } = await db.functions.invoke("razorpay-create-order", { body: { order_id: orderId } });
  if (error || !data?.razorpay_order_id) throw new Error(data?.error || "Could not start the payment.");
  const fail = async () => { await client.functions.invoke("razorpay-verify", { body: { order_id: orderId, failed: true } }); onDone(false); };
  let settled = false;
  const rzp = new window.Razorpay!({
    key: data.key_id, amount: data.amount, currency: data.currency, order_id: data.razorpay_order_id,
    name: "Studio / Store", description: `Order ${data.order_number}`,
    prefill: { name: customer.name, email: customer.email, contact: customer.phone },
    theme: { color: "#7452b8" },
    handler: async (r: Record<string, string>) => {
      settled = true;
      const res = await client.functions.invoke("razorpay-verify", { body: { order_id: orderId, ...r } });
      onDone(!res.error && res.data?.status === "paid");
    },
    modal: { ondismiss: () => { if (!settled) { settled = true; void fail(); } } },
  });
  rzp.on("payment.failed", () => { if (!settled) { settled = true; void fail(); } });
  rzp.open();
}
