import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_ECOM_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_ECOM_SUPABASE_ANON_KEY as string | undefined;

// Separate storage key prevents the store's session from overwriting the original site's session.
export const ecommerceSupabase = url && key && !url.includes('YOUR_PROJECT')
  ? createClient(url, key, {
      auth: {
        storageKey: 'ecommerce-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isEcommerceConfigured = Boolean(ecommerceSupabase);
