import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Sign in is required.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('ORDER_FROM_EMAIL');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: 'Server is not configured.' }, 500);
  if (!resendKey || !fromEmail) return json({ error: 'Email notifications are not configured.' }, 503);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return json({ error: 'Invalid session.' }, 401);

  let orderId = '';
  try {
    const body = await req.json();
    orderId = typeof body?.order_id === 'string' ? body.order_id : '';
  } catch { return json({ error: 'Invalid request body.' }, 400); }
  if (!orderId) return json({ error: 'order_id is required.' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  // The order must belong to the authenticated caller; the service key never reaches the browser.
  const { data: order, error: orderError } = await adminClient.from('ecommerce_orders')
    .select('id, order_number, user_id, customer_name, total, status')
    .eq('id', orderId).eq('user_id', user.id).maybeSingle();
  if (orderError || !order) return json({ error: 'Order not found for this account.' }, 404);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: [user.email],
      subject: `Order ${order.order_number} received`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#21182e"><h1 style="color:#7452b8">Thank you for your order.</h1><p>Hi ${escapeHtml(order.customer_name)},</p><p>We've received order <strong>${escapeHtml(order.order_number)}</strong>.</p><p>Order total: <strong>${new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(order.total))}</strong></p><p>Current status: ${escapeHtml(order.status)}.</p><p>We'll keep you updated as it moves along.</p><p style="color:#80758d;font-size:12px">Studio / Store</p></div>`,
    }),
  });
  if (!response.ok) return json({ error: 'The order was saved, but the confirmation email could not be sent.' }, 502);
  return json({ ok: true });
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}
