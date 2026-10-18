-- Run in Supabase SQL Editor. Never expose the service_role key in a browser.
create table if not exists public.contact_submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  company text check (char_length(company) <= 160),
  service text not null default 'Other',
  message text not null check (char_length(message) between 10 and 5000),
  consent boolean not null default false check (consent = true),
  source text
);
alter table public.contact_submissions enable row level security;
-- Public visitors may INSERT contact requests only. Do not create a public SELECT policy.
grant insert on table public.contact_submissions to anon, authenticated;
grant usage, select on sequence public.contact_submissions_id_seq to anon, authenticated;
create policy "Public can submit contact requests"
on public.contact_submissions for insert to anon, authenticated
with check (
  consent = true
  and char_length(name) between 1 and 100
  and char_length(email) <= 254
  and char_length(message) between 10 and 5000
);
-- Before production, add rate limiting / abuse protection via a Cloudflare Worker
-- or Supabase Edge Function, plus a CAPTCHA or Turnstile challenge if needed.
