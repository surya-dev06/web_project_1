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
