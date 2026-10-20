import { createClient } from "npm:@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGIN") ?? "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
async function hmacHex(secret: string, message: string) { const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message))); return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(""); }
function safeEqual(a: string, b: string) { if (a.length !== b.length) return false; let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0; }
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const auth = req.headers.get("Authorization"); if (!auth) return json({ error: "Sign in is required." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!; const anon = Deno.env.get("SUPABASE_ANON_KEY")!; const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!secret) return json({ error: "Razorpay server secret is not configured." }, 503);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } }); const { data: { user } } = await userClient.auth.getUser(); if (!user) return json({ error: "Your session has expired." }, 401);
    const body = await req.json(); const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (![order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature].every((v) => typeof v === "string" && v.length > 0)) return json({ error: "Payment verification fields are incomplete." }, 400);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } }); const { data: order, error } = await admin.from("ecommerce_orders").select("id,user_id,razorpay_order_id,payment_status").eq("id", order_id).single();
    if (error || !order || order.user_id !== user.id) return json({ error: "Order not found." }, 404);
    if (order.payment_status === "paid") return json({ verified: true, already_verified: true });
    if (order.razorpay_order_id !== razorpay_order_id) return json({ error: "Payment order reference does not match." }, 400);
    const expected = await hmacHex(secret, `${razorpay_order_id}|${razorpay_payment_id}`); if (!safeEqual(expected, razorpay_signature)) return json({ error: "Payment signature is invalid." }, 400);
    const { error: updateError } = await admin.from("ecommerce_orders").update({ payment_status: "paid", razorpay_payment_id, status: "confirmed" }).eq("id", order.id).eq("user_id", user.id).neq("payment_status", "paid");
    if (updateError) return json({ error: "Signature verified but order update failed. Contact support with your payment reference." }, 500);
    return json({ verified: true });
  } catch (e) { return json({ error: e instanceof Error ? e.message : "Unexpected verification error." }, 500); }
});
