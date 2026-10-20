import { createClient } from 'npm:@supabase/supabase-js@2';

export const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
export const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: cors });

// Returns the signed-in user plus a service-role client (never exposed to the browser).
export async function authenticate(req: Request) {
  const auth = req.headers.get('Authorization');
  const url = Deno.env.get('SUPABASE_URL')!;
  if (!auth?.startsWith('Bearer ')) return null;
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } }, auth: { persistSession: false },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return null;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  return { user, admin };
}

export const razorpayAuth = (id: string, secret: string) => 'Basic ' + btoa(`${id}:${secret}`);

export async function hmacHex(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string comparison (prevents timing attacks on signatures).
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
