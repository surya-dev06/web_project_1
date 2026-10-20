# Setup guide — Business, Restaurant and E-commerce

## Architecture

- **Supabase project A:** the existing business/portfolio site and restaurant ordering system. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for this project. Run the relevant SQL files in `supabase/schema.sql` and `project_2/supabase/schema.sql` in that project, reviewing any existing objects before applying.
- **Supabase project B:** the independent e-commerce database. Set `VITE_ECOM_SUPABASE_URL` and `VITE_ECOM_SUPABASE_ANON_KEY`; run `supabase/ecommerce-schema.sql` only in project B. Do not delete your old Supabase project until you have exported/backed up data and verified both sites against the new setup.
- Browser environment variables must only contain Supabase URL/publishable (anon) keys and public site settings. Never put a Supabase service-role key or Razorpay secret in a `VITE_` variable.

## Local development

Requires Node.js 20.19+ or 22.12+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Windows PowerShell: `Copy-Item .env.example .env.local`. Fill in `.env.local`, then restart Vite. Business site: `/project_1/`; restaurant: `/project_2/`; e-commerce: `/e_comm/`.

## E-commerce Supabase

1. Create a **new Supabase project** dedicated to e-commerce.
2. In Project Settings → API, copy Project URL and publishable/anon key into `VITE_ECOM_SUPABASE_URL` and `VITE_ECOM_SUPABASE_ANON_KEY`.
3. In project B SQL Editor, run `supabase/ecommerce-schema.sql`. It creates the product catalog, order tables, RLS and server-side order RPC. The schema intentionally does not seed fake products; add your actual catalog in `/e_comm/admin/products` after assigning an administrator.
4. Create an admin account under Authentication → Users. Copy that user's UUID and run:

```sql
insert into public.ecommerce_admins (user_id)
values ('REPLACE_WITH_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

5. Sign in at `/e_comm/account`, then open `/e_comm/admin/products` to create, update, publish/hide or remove products. Product images should be owned/licensed by your business and hosted on your domain or a trusted storage bucket.
6. Configure Authentication → URL Configuration with your local and production redirect URLs. Disable public account creation if your business does not want open registration.

## Razorpay test and live payment setup

**Never use live mode until your legal business profile, policies, return/refund handling and test transactions have been reviewed.**

1. Create a Razorpay account and use Test Mode credentials first.
2. In Supabase project B → Edge Functions → Secrets, set:
   - `RAZORPAY_KEY_ID` — test key ID, then live key ID after launch approval
   - `RAZORPAY_KEY_SECRET` — secret key; server-side only
   - `SUPABASE_SERVICE_ROLE_KEY` — project B service role key; server-side only
   - `SUPABASE_ANON_KEY` — project B anon/publishable key for request user validation
   - `SITE_ORIGIN` — your exact production origin, e.g. `https://shop.example.com`
   - `STORE_NAME` — your registered storefront name
3. Deploy both Edge Functions from this repository to project B:

```bash
supabase login
supabase link --project-ref YOUR_ECOM_PROJECT_REF
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

4. Keep the Razorpay checkout SDK loaded from Razorpay's official checkout script. The client asks the Edge Function to create a Razorpay order, then sends the returned signature to `verify-razorpay-payment`. The function validates the HMAC using the secret and marks the order paid only after successful verification.
5. In Razorpay Dashboard, configure webhook events for payment captured/failed and point them to a separately deployed webhook endpoint if you want server-to-server reconciliation. Do not trust only a browser callback for final fulfillment. This package's callback verification is the synchronous checkout verification path; a production webhook reconciler is recommended before launch.
6. Run successful, declined, dismissed, duplicate callback, tampered signature, insufficient stock and network interruption tests in Test Mode. Confirm order/payment status in Supabase and Razorpay Dashboard. Switch to live keys only after all tests pass.

### Payment and inventory note

The current order RPC reserves/decrements stock when the order is created. If a payment is abandoned, staff should reconcile the pending order and inventory; implement an atomic cancellation/refund inventory-release workflow before high-volume production. Never manually mark an order paid from the browser.

## Deploying the Edge Functions

Run Supabase CLI commands from the folder containing `supabase/`. Project A's restaurant notification function belongs to project A; the Razorpay functions belong to project B. Set secrets separately in each project. Use `supabase secrets set NAME=value` only in a trusted terminal and do not commit `.env.local`.

## Product assets and legal policies

No real store catalog can be inferred from a screenshot or ZIP. The storefront starts with an empty catalog rather than pretending demo products are real. Add your actual products, prices, stock and licensed images in the admin. The included Terms and Privacy pages are starter templates; have them reviewed and replace the business contact, refund/return and retention details before launch.
