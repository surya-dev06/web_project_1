import { authenticate, cors, json } from '../_shared/common.ts';

async function hmacHex(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const ctx = await authenticate(req);
  if (!ctx) return json({ error: 'Sign in is required.' }, 401);
  const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!secret) return json({ error: 'Payments are not configured.' }, 503);

  const b = await req.json().catch(() => ({}));
  const { data: order } = await ctx.admin.from('ecommerce_orders')
    .select('id, razorpay_order_id, payment_status').eq('id', b.order_id).eq('user_id', ctx.user.id).maybeSingle();
  if (!order) return json({ error: 'Order not found.' }, 404);

  // Customer closed the window or the payment failed: cancel and restock.
  if (b.failed) {
    await ctx.admin.rpc('ecommerce_fail_order', { p_order_id: order.id });
    return json({ ok: true, status: 'failed' });
  }
  if (order.payment_status === 'paid') return json({ ok: true, status: 'paid' });
  if (!order.razorpay_order_id || b.razorpay_order_id !== order.razorpay_order_id) return json({ error: 'Payment mismatch.' }, 400);

  const expected = await hmacHex(secret, `${order.razorpay_order_id}|${b.razorpay_payment_id}`);
  if (expected !== b.razorpay_signature) {
    await ctx.admin.rpc('ecommerce_fail_order', { p_order_id: order.id });
    return json({ error: 'Payment signature could not be verified.' }, 400);
  }
  await ctx.admin.from('ecommerce_orders').update({
    payment_status: 'paid', status: 'confirmed', razorpay_payment_id: b.razorpay_payment_id, paid_at: new Date().toISOString(),
  }).eq('id', order.id);
  return json({ ok: true, status: 'paid' });
});
