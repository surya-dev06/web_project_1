import { authenticate, cors, json, razorpayAuth } from '../_shared/common.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const ctx = await authenticate(req);
  if (!ctx) return json({ error: 'Sign in is required.', code: 'auth' }, 401);
  const keyId = Deno.env.get('RAZORPAY_KEY_ID')?.trim();
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim();
  if (!keyId || !keySecret) return json({ error: 'Payments are not configured.', code: 'not_configured' }, 503);

  const { order_id } = await req.json().catch(() => ({}));
  if (typeof order_id !== 'string') return json({ error: 'order_id is required.', code: 'bad_request' }, 400);

  // Amount is read from OUR database, never trusted from the browser.
  const { data: order } = await ctx.admin.from('ecommerce_orders')
    .select('id, order_number, total, payment_status, razorpay_order_id')
    .eq('id', order_id).eq('user_id', ctx.user.id).maybeSingle();
  if (!order) return json({ error: 'Order not found.', code: 'not_found' }, 404);
  if (order.payment_status !== 'unpaid') return json({ error: 'This order is already settled.', code: 'settled' }, 409);

  const amount = Math.round(Number(order.total) * 100);
  if (!Number.isFinite(amount) || amount < 100) return json({ error: 'Order amount is invalid.', code: 'bad_amount' }, 400);

  // Re-use the Razorpay order if this order already has one. Creating a second one
  // while the first checkout is still open caused "Payment mismatch" (400) on verify.
  if (order.razorpay_order_id) {
    return json({ key_id: keyId, razorpay_order_id: order.razorpay_order_id, amount, currency: 'INR', order_number: order.order_number });
  }

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: razorpayAuth(keyId, keySecret), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR', receipt: order.order_number, notes: { order_id: order.id } }),
  });
  if (!res.ok) {
    console.error('Razorpay create order failed', res.status, await res.text());
    return json({ error: 'Could not start the payment. Please try again.', code: 'razorpay_error' }, 502);
  }
  const rp = await res.json();
  const { error: upErr } = await ctx.admin.from('ecommerce_orders').update({ razorpay_order_id: rp.id }).eq('id', order.id);
  if (upErr) { console.error('Saving razorpay_order_id failed', upErr); return json({ error: 'Could not start the payment.', code: 'db_error' }, 500); }
  return json({ key_id: keyId, razorpay_order_id: rp.id, amount: rp.amount, currency: rp.currency, order_number: order.order_number });
});
