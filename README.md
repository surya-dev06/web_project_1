# Northstar Studio: animated React + Vite starter

A multi-page, responsive marketing-site starter using React, TypeScript, Vite, React Router, Motion, React Three Fiber, Supabase and Cloudflare Pages.

**Design read:** a premium independent digital studio for restaurants, agencies, consultants and startups, with restrained cinematic 3D, editorial spacing, porcelain/indigo/coral palette and high-intent conversion paths.

**Design dials:** variance 8/10, motion 7/10, visual density 4/10. Motion communicates hierarchy and interaction; the site respects `prefers-reduced-motion`.

## Included routes and sections

- `/` Home: animated 3D hero, intro, service rows, image-led concept gallery, approach statement and CTA
- `/services` services and delivery process
- `/work` portfolio concept gallery
- `/about` studio story and principles
- `/contact` enquiry form, WhatsApp, email
- `/auth` Supabase email/password sign-in and sign-up starter
- `/privacy` privacy policy template
- `/terms` terms template
- catch-all 404 page
- reusable navigation/footer, SEO metadata component, Google Analytics 4 loader
- Supabase insert-only contact form and SQL schema

## Important honesty / production notes

- Images are real Unsplash-hosted photography, but the project tiles are **concept examples**, not verified client case studies. Replace with photos you own or are licensed to use, and do not claim the concept names as clients.
- The Northstar name, email, phone, domain and legal wording are placeholders. Update before launch.
- Client-side validation is for usability, not security. Add rate limiting / abuse controls and verify your Supabase RLS policies. Never expose a service-role key.
- SPA meta tags are set client-side. For stronger SEO at scale, consider prerendering/static generation (e.g. Vite SSG) or SSR, and validate every route with Search Console.
- No SEO tool can promise rankings. Semrush's full suite is a commercial service; Google Search Console and Bing Webmaster Tools have free webmaster features. Google Analytics is free, but analytics consent obligations vary by region.

## 1. Install and run

Use Node.js 20.19+ or 22.12+ for current Vite versions.

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local`.

The site runs locally even without Supabase; the contact form will show a configuration error until environment variables are set.

## 2. Supabase backend and authentication

1. Create a project at https://supabase.com.
2. In Project Settings / API, copy the Project URL and publishable/anon key to `.env.local`.
3. Open SQL Editor and run `supabase/schema.sql`.
4. Test one valid contact request and one invalid request. Verify the row appears in Table Editor.
5. Keep RLS enabled. Do not add public `SELECT`, `UPDATE`, or `DELETE` policies for enquiries.
6. Configure CAPTCHA/rate limiting before production.

### Supabase Authentication starter

The `/auth` route demonstrates email/password sign-up and sign-in using Supabase Auth. In Supabase Dashboard → Authentication → URL Configuration, set the production Site URL and allowed redirect URLs. Configure email confirmation and SMTP for production. This starter does not create a staff dashboard or protect private routes. If you need a private staff inbox, build server-enforced role checks and staff-only RLS policies; never authorize staff solely based on a client-side flag or editable user metadata.

## 3. Images and motion

- Replace image URLs in `src/pages/Home.tsx` and `src/pages/Work.tsx` with your licensed images, ideally WebP/AVIF served from your own domain or Cloudflare Images/R2.
- 3D scene is in `src/components/Scene3D.tsx`.
- Scroll reveal component is in `src/components/Reveal.tsx`.
- CSS hover zoom and responsive rules are in `src/styles.css`.
- Test on a real phone. 3D uses GPU; if low-power/mobile performance suffers, lazy-load the Canvas or render a static image fallback.
- Respect reduced motion; don't animate every element constantly.

## 4. Analytics, Search Console and SEO

1. Create a GA4 property at https://analytics.google.com and add its `G-...` Measurement ID to `VITE_GA_ID`. The ID is issued by Google; you do not invent it.
2. Verify your domain in https://search.google.com/search-console using DNS (recommended for a Domain property) or the HTML meta tag for a URL-prefix property. Google gives you the unique verification value; submit `/sitemap.xml` after verification.
3. Add the site to https://www.bing.com/webmasters and submit the sitemap.
4. Use https://pagespeed.web.dev/ and Lighthouse for Core Web Vitals; fix image weight, JavaScript, accessibility and layout shift.
5. Semrush is a commercial SEO platform with some limited/free tools; it is not open-source. Create a project using your live domain and run Site Audit. Semrush does not provide a universal website tracking ID that this starter needs; do not add an invented `VITE_SEMRUSH_SITE_ID`. Follow the exact verification instructions shown in your Semrush project.
6. Update the canonical URL, sitemap, robots file, Open Graph image and all titles/descriptions with the real production domain.
7. Add schema.org JSON-LD for your real Organization/LocalBusiness details only when accurate. Avoid fabricated ratings, reviews, awards or client names.
8. If you use analytics or marketing cookies, publish a consent mechanism and privacy disclosure appropriate to your visitors and applicable laws.

## 5. Deploy to Cloudflare Pages

### Git-connected deployment (recommended)
1. Push this folder to a GitHub repository.
2. In Cloudflare Dashboard, open Workers & Pages → Create → Pages → Connect to Git.
3. Choose the repository.
4. Build command: `npm run build`
5. Build output directory: `dist`
6. Add production environment variables under Settings → Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_GA_ID`, `VITE_WHATSAPP_NUMBER`.
7. Deploy, test every route and form, then attach your custom domain.
8. `public/_redirects` contains the SPA fallback. Check it after deployment.

Cloudflare Pages is suitable for the static React frontend. Supabase remains the managed backend. For edge-side validation/rate limits, add a Cloudflare Worker or Supabase Edge Function.

## 6. Endpoint and release test checklist

- [ ] `/`, `/services`, `/work`, `/about`, `/contact`, `/privacy`, `/terms` load directly and after refresh
- [ ] unknown route shows 404
- [ ] contact: empty fields blocked, malformed email blocked, message under 10 chars blocked, consent required
- [ ] valid submission inserts one row; success message appears; no duplicate row on one submit
- [ ] simulate Supabase offline/wrong key and confirm error message is visible
- [ ] RLS prevents public reading of contact submissions
- [ ] WhatsApp opens with expected number/message; email link uses real inbox
- [ ] keyboard focus, labels, mobile menu, contrast and reduced motion tested
- [ ] `npm run build` succeeds and `dist/` is produced
- [ ] production domain, canonical tags, robots and sitemap updated
- [ ] GA4 Realtime receives page/event data after consent rules are met
- [ ] Search Console ownership verified and sitemap accepted
- [ ] Lighthouse: mobile performance, accessibility, best practices, SEO reviewed
- [ ] privacy/terms reviewed by a qualified professional for the actual business

## 7. Recommended follow-up enhancements

- Staff-only enquiry inbox using Supabase Auth and server-verified admin permissions
- Turnstile/CAPTCHA plus rate limiting
- transactional email via a provider or Supabase Edge Function (never expose API secrets in the client)
- real case studies and client approvals
- static prerendering for per-route HTML metadata
- error monitoring and analytics consent manager


## Bright theme and scroll controls

The CSS now uses a light porcelain background, ink text, electric indigo primary accent, and warm coral hover accent. `src/components/ScrollToTop.tsx` smoothly scrolls to the page top on route changes and provides a floating back-to-top button after scrolling. The contact form captures its form element before awaiting Supabase, fixing the `Cannot read properties of null (reading 'reset')` error; network exceptions now show a user-facing error.

## Push to GitHub

1. Create a new **empty** repository on GitHub (do not initialize it with a README).
2. In a terminal at the project root run:

```bash
git init
git add .
git commit -m "Build responsive animated business website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the URL with your repository URL. Ensure `.env.local` is ignored by Git and never commit secret keys. The included `.env.example` contains placeholders only.
