import { authenticate, cors, json } from '../_shared/common.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const ctx = await authenticate(req);
  if (!ctx) return json({ error: 'Sign in is required.' }, 401);
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!keyId || !keySecret) return json({ error: 'Payments are not configured.' }, 503);

  const { order_id } = await req.json().catch(() => ({}));
  if (typeof order_id !== 'string') return json({ error: 'order_id is required.' }, 400);

  // Amount is read from OUR database, never trusted from the browser.
  const { data: order } = await ctx.admin.from('ecommerce_orders')
    .select('id, order_number, total, payment_status')
    .eq('id', order_id).eq('user_id', ctx.user.id).maybeSingle();
  if (!order) return json({ error: 'Order not found.' }, 404);
  if (order.payment_status !== 'unpaid') return json({ error: 'This order is already settled.' }, 409);

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + btoa(`${keyId}:${keySecret}`), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Math.round(Number(order.total) * 100), currency: 'INR', receipt: order.order_number }),
  });
  if (!res.ok) return json({ error: 'Could not start the payment. Please try again.' }, 502);
  const rp = await res.json();
  await ctx.admin.from('ecommerce_orders').update({ razorpay_order_id: rp.id }).eq('id', order.id);
  return json({ key_id: keyId, razorpay_order_id: rp.id, amount: rp.amount, currency: rp.currency, order_number: order.order_number });
});
