import { createClient } from "npm:@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") ?? "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Sign in is required." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!; const anon = Deno.env.get("SUPABASE_ANON_KEY")!; const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Your session has expired. Sign in again." }, 401);
    const { order_id } = await req.json(); if (typeof order_id !== "string") return json({ error: "Order reference is required." }, 400);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: order, error } = await admin.from("ecommerce_orders").select("id,order_number,user_id,total,payment_status").eq("id", order_id).single();
    if (error || !order || order.user_id !== user.id) return json({ error: "Order not found." }, 404);
    if (order.payment_status === "paid") return json({ error: "This order has already been paid." }, 409);
    const keyId = Deno.env.get("RAZORPAY_KEY_ID"); const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) return json({ error: "Razorpay server credentials are not configured." }, 503);
    const amount = Math.round(Number(order.total) * 100); if (!Number.isSafeInteger(amount) || amount < 100) return json({ error: "Order amount is invalid." }, 400);
    const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount, currency: "INR", receipt: String(order.order_number).slice(0, 40), notes: { order_id: order.id, user_id: user.id } }) });
    const razorpayOrder = await response.json(); if (!response.ok) return json({ error: razorpayOrder?.error?.description || "Razorpay could not create an order." }, 502);
    const { error: updateError } = await admin.from("ecommerce_orders").update({ razorpay_order_id: razorpayOrder.id, payment_status: "created" }).eq("id", order.id).eq("user_id", user.id);
    if (updateError) return json({ error: "Payment order was created but could not be linked. Contact support before retrying." }, 500);
    return json({ key_id: keyId, razorpay_order_id: razorpayOrder.id, amount, currency: "INR", order_number: order.order_number, store_name: Deno.env.get("STORE_NAME") || "Store" });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unexpected payment setup error." }, 500); }
});
