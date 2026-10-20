# Setup: two Supabase projects + Razorpay (store)

You need TWO Supabase projects:
| Project | Used by | Env vars |
|---|---|---|
| `suryadevs-main` | project_1 (portfolio) + project_2 (restaurant) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `suryadevs-store` | e_comm store | `VITE_ECOM_SUPABASE_URL`, `VITE_ECOM_SUPABASE_ANON_KEY` |

## 1. Replace the old Supabase project
1. Supabase dashboard → open the old project → Settings → General → **Delete project**.
2. New project → create `suryadevs-main` and `suryadevs-store` (same region, e.g. Mumbai).
3. In each: Project Settings → API → copy **Project URL** and **anon/publishable key** into `.env.local` (and into Cloudflare → Settings → Environment variables). Never put the service_role key in `.env` or the frontend.

## 2. Main project (project_1 + project_2)
SQL Editor → run `supabase/schema.sql`, then `project_2/supabase/schema.sql`. Create the restaurant admin as described in the README.

## 3. Store project
SQL Editor → run in order: `supabase/ecommerce-schema.sql`, then `supabase/ecommerce-razorpay.sql`.
Make yourself admin: Authentication → Users → create/sign up your user, copy the UUID, then run:
```sql
insert into public.ecommerce_admins (user_id) values ('PASTE-USER-UUID');
```
Open `/e_comm/admin` and sign in via `/e_comm/account` first. Admin has Overview, Products (add / edit / delete, image upload), Orders (status updates).

## 4. Razorpay keys
Razorpay Dashboard → Account & Settings → API Keys → generate **Test** keys first (`rzp_test_...`). Test card: any valid test card from Razorpay docs; UPI test: `success@razorpay`.

## 5. Edge Functions + environment variables (secrets)
Install the CLI (`npm i -g supabase`), then from the project root:
```bash
supabase login
supabase link --project-ref <STORE_PROJECT_REF>
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx ALLOWED_ORIGIN=https://suryadevs.in
supabase secrets set RESEND_API_KEY=xxx ORDER_FROM_EMAIL="Store <orders@yourdomain.com>"   # optional email
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify
supabase functions deploy order-notification
```
`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically; you do not set them. The frontend calls the functions through the Supabase client, so no extra frontend variable is needed. The Razorpay secret never reaches the browser.

## 6. Go live with real payments
Complete Razorpay KYC, generate **Live** keys, re-run `supabase secrets set` with `rzp_live_...`. Keep the Terms/Privacy placeholders (`src/e_comm/Legal.tsx`) filled with your real business details.
Recommended next: add a Razorpay webhook (`payment.captured`) so orders still confirm if a customer closes the tab right after paying.

## Flow
Checkout creates the order (stock reserved) → `razorpay-create-order` (amount read from DB) → Razorpay popup → `razorpay-verify` checks the HMAC signature → `/e_comm/payment/success`. Cancelled/failed payments restock items and go to `/e_comm/payment/failed`.
