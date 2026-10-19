-- Plum & Plate demo schema. Run in Supabase SQL Editor as project owner.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "Staff can read own membership" on public.admin_users;
create policy "Staff can read own membership" on public.admin_users for select to authenticated using (user_id = auth.uid());
create or replace function public.is_restaurant_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()); $$;
revoke all on function public.is_restaurant_admin() from public;
grant execute on function public.is_restaurant_admin() to anon, authenticated;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '',
  category text not null check (category in ('Starters','Mains','Desserts','Drinks')),
  price numeric(10,2) not null check (price > 0),
  image_url text not null default '',
  is_available boolean not null default true,
  is_vegetarian boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.menu_items enable row level security;
drop policy if exists "Anyone can read available menu items" on public.menu_items;
create policy "Anyone can read available menu items" on public.menu_items for select to anon, authenticated using (is_available or public.is_restaurant_admin());
drop policy if exists "Admins manage menu items" on public.menu_items;
create policy "Admins manage menu items" on public.menu_items for all to authenticated using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text,
  table_number integer check (table_number is null or table_number between 1 and 999),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  total numeric(10,2) not null check (total > 0),
  status text not null default 'new' check (status in ('new','preparing','ready','served','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
alter table public.orders enable row level security;

create or replace function public.assign_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    new.order_number := 'PP-' || upper(substr(replace(new.id::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;
drop trigger if exists assign_order_number_before_insert on public.orders;
create trigger assign_order_number_before_insert before insert on public.orders
for each row execute function public.assign_order_number();

drop policy if exists "Customers can create orders" on public.orders;
create policy "Customers can create orders" on public.orders for insert to anon, authenticated
with check (
  char_length(customer_name) >= 2 and total > 0 and status = 'new'
  and jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0
);
-- Only staff can select full order rows. Customers use a token-checked RPC that returns a limited status payload.
drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders for select to authenticated using (public.is_restaurant_admin());

create or replace function public.get_order_status(p_order_id uuid, p_tracking_token uuid)
returns jsonb language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'id', id, 'order_number', order_number, 'status', status,
    'total', total, 'created_at', created_at, 'items', items
  )
  from public.orders
  where id = p_order_id and tracking_token = p_tracking_token
  limit 1;
$$;
revoke all on function public.get_order_status(uuid, uuid) from public;
grant execute on function public.get_order_status(uuid, uuid) to anon, authenticated;
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated
using (public.is_restaurant_admin()) with check (public.is_restaurant_admin());
drop policy if exists "Admins delete orders" on public.orders;
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.is_restaurant_admin());

-- Add staff users only after creating their accounts in Authentication > Users:
-- insert into public.admin_users (user_id) values ('AUTH_USER_UUID_HERE');
-- Never expose the Supabase service-role key in frontend environment variables.
