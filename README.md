# Surya Devs Project Suite

A single React + Vite + TypeScript app for `https://suryadevs.in` with both projects under dedicated route prefixes:

- Project 1: `/project_1/`, `/project_1/services`, `/project_1/work`, `/project_1/about`, `/project_1/contact`, `/project_1/auth`, `/project_1/privacy`, `/project_1/terms`
- Project 2: `/project_2/`, `/project_2/menu`, `/project_2/cart`, `/project_2/order/:orderId`, `/project_2/admin/login`, `/project_2/admin`

Project 2 is a restaurant ordering demo called Plum & Plate. It includes a menu with categories/search/vegetarian filter, cart quantity controls, order placement, private-token order tracking, a Supabase Auth admin login, order status management, dish add/remove/availability, table overview and reports. It uses a dark purple, bright purple, lilac and white design system, food photography, 3D-like CSS depth, floating elements, hover transitions, and reduced-motion support.

The restaurant name and food list are a demonstration identity/content set. The photography is remotely served by Unsplash URLs; replace these with licensed/self-hosted images before a production restaurant launch. No customer reviews or client claims are fabricated.

## 1. Local setup

Use Node.js 20.19+ or 22.12+ for current Vite versions.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. The UI works in demo mode without Supabase; menu edits and real order persistence require Supabase.

## 2. Supabase setup

1. Create a project at https://supabase.com.
2. In Project Settings → API, copy the project URL and the publishable/anon key into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. In SQL Editor, run `project_2/supabase/schema.sql`.
4. In Authentication → Users, create a staff account with email/password. If public sign-up is not needed, disable it in Authentication settings.
5. Copy the new user's UUID from Authentication → Users. Run this SQL as project owner, replacing the example UUID:

```sql
insert into public.admin_users (user_id)
values ('REPLACE_WITH_AUTH_USER_UUID');
```

6. In Authentication → URL Configuration, set Site URL to `https://suryadevs.in` and add redirect URLs needed by your deployed site. For this password-login flow, test sign-in on `/project_2/admin/login`.
7. Restart Vite after changing `.env.local`.

**Admin password:** Supabase Auth owns password storage and verification. This project does not hardcode an admin password. The user must be explicitly added to `public.admin_users` to receive the admin role. Never expose a service-role key in browser code.

### Security notes before using with a real restaurant

- The public order insert policy validates basic fields, but browser-sent prices are not trusted. In production, submit a cart of menu item IDs and quantities to a Supabase Edge Function, calculate prices server-side from the database, rate-limit requests, validate table/restaurant ownership, and return a short-lived order tracking token.
- Customer tracking uses an order UUID plus a random tracking token. The RPC only returns status fields, not phone or notes. Keep the tracking token private.
- Add CAPTCHA/rate limiting and spam monitoring to public order creation.
- Admin menu/order operations are guarded by `public.is_restaurant_admin()` and RLS. Review SQL policies for your specific workflow.
- The `project_2` demo mode stores the most recent sample order in sessionStorage; it is not real backend persistence.

## 3. Architecture and page files

```text
src/
  App.tsx                       # Routes both projects
  main.tsx
  pages/                        # Project 1 pages, one TSX per page
  components/                   # Project 1 shared components
project_2/src/
  RestaurantApp.tsx
  types.ts
  data/menu.ts
  lib/supabase.ts
  components/RestaurantLayout.tsx
  pages/RestaurantHome.tsx
  pages/MenuPage.tsx
  pages/CartPage.tsx
  pages/OrderStatusPage.tsx
  pages/admin/AdminLogin.tsx
  pages/admin/AdminDashboard.tsx
  restaurant.css
project_2/supabase/schema.sql
```

The root Vite app is the production build for both projects. The `project_1/` folder retains your original project source snapshot for reference; make production edits in root `src/` and `project_2/src/` so both routes are part of the same deployment.

## 4. GitHub

Before committing, ensure `.env.local` is not tracked. `.gitignore` excludes `.env*` except `.env.example`.

```bash
git init
git add .
git status
git commit -m "Build Surya Devs project suite"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If your existing repository already has a remote and commit history, use its existing clone and merge/copy these files there instead of running `git init` over it. Never commit the `.git` directory from an uploaded archive or any real secret values.

## 5. Cloudflare Pages deployment

1. Push the project to GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Select the repository and set:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (repository root)
4. Add environment variables in Cloudflare Pages settings for Production and Preview:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL=https://suryadevs.in`
   - Optional: `VITE_GA_ID`
5. Deploy. Open and refresh both `/project_1/` and `/project_2/menu` to test SPA routing.
6. In Cloudflare Pages → Custom domains, attach `suryadevs.in`. If DNS is managed elsewhere, follow Cloudflare's provided DNS instructions. Preserve any existing DNS/email records.
7. Test the production site, Supabase login, ordering, menu edits, and RLS behavior.

The included `public/_redirects` provides SPA fallback routing. Cloudflare's Git deployment can automatically rebuild on pushes to the configured branch.

## 6. SEO and Google Search Console

- Canonical domain, base title/description, robots.txt and sitemap.xml are set to `https://suryadevs.in`. Check the final canonical and metadata for every important route before launch.
- Single-page app metadata is updated client-side in some Project 1 pages. For the strongest SEO, prerender public marketing/menu routes so each route ships its own title, description and structured data in initial HTML. Do not add private admin/cart/order routes to the sitemap.
- In https://search.google.com/search-console, add a **Domain property** for `suryadevs.in`, verify it using the DNS TXT record Google gives you, then submit `https://suryadevs.in/sitemap.xml`.
- Keep the sitemap limited to canonical, indexable public pages. Remove `/project_2/admin/*`, `/project_2/cart` and private order URLs from the sitemap.
- Use unique page titles/descriptions, meaningful image alt text, compressed WebP/AVIF images, one clear H1 per page, internal links and Organization/Person structured data only when accurate.
- Add Google Analytics only if you want it and have a real `VITE_GA_ID`; do not invent a measurement ID. Respect applicable privacy/consent requirements.
- Search Console confirms crawl/indexing data, not guaranteed ranking.

## 7. Pre-launch test checklist

- [ ] `npm run build` succeeds
- [ ] Direct load and refresh on `/project_1/`, `/project_1/work`, `/project_2/`, `/project_2/menu`, `/project_2/cart`
- [ ] Customer can filter/search dishes and update cart quantities
- [ ] Supabase insert creates an order and token RPC returns its status
- [ ] A non-admin Auth user is rejected from the dashboard
- [ ] Admin can update order statuses, add a dish, hide/show a dish and remove a dish
- [ ] RLS prevents anonymous access to admin data and full order rows
- [ ] Mobile layout, keyboard focus and reduced-motion settings are tested
- [ ] Search Console sitemap is submitted and the canonical domain resolves over HTTPS
