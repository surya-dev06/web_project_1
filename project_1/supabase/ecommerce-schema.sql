-- E-commerce schema for the SEPARATE e-commerce Supabase project.
-- Run this only in the new store project's SQL Editor. It does not drop or alter
-- the existing portfolio or restaurant project tables.
begin;

create extension if not exists pgcrypto;

create table if not exists public.ecommerce_products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  category text not null default 'General',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  image_avif text,
  image_svg text,
  image_jpg text,
  stock integer not null default 0 check (stock >= 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecommerce_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.ecommerce_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ST-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  user_id uuid not null references auth.users(id) on delete restrict,
  customer_name text not null check (length(trim(customer_name)) between 1 and 160),
  phone text not null check (length(trim(phone)) between 8 and 30),
  shipping_address text not null check (length(trim(shipping_address)) between 8 and 1200),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecommerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ecommerce_orders(id) on delete cascade,
  product_id uuid references public.ecommerce_products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity between 1 and 100),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists ecommerce_products_active_category_idx on public.ecommerce_products(is_active, category);
create index if not exists ecommerce_orders_user_created_idx on public.ecommerce_orders(user_id, created_at desc);
create index if not exists ecommerce_order_items_order_idx on public.ecommerce_order_items(order_id);

create or replace function public.ecommerce_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists ecommerce_products_updated_at on public.ecommerce_products;
create trigger ecommerce_products_updated_at before update on public.ecommerce_products
for each row execute function public.ecommerce_set_updated_at();
drop trigger if exists ecommerce_orders_updated_at on public.ecommerce_orders;
create trigger ecommerce_orders_updated_at before update on public.ecommerce_orders
for each row execute function public.ecommerce_set_updated_at();

create or replace function public.ecommerce_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.ecommerce_admins a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.ecommerce_is_admin() from public;
grant execute on function public.ecommerce_is_admin() to anon, authenticated;

alter table public.ecommerce_products enable row level security;
alter table public.ecommerce_admins enable row level security;
alter table public.ecommerce_orders enable row level security;
alter table public.ecommerce_order_items enable row level security;

drop policy if exists ecommerce_products_public_read on public.ecommerce_products;
create policy ecommerce_products_public_read on public.ecommerce_products
for select to anon, authenticated using (is_active = true or public.ecommerce_is_admin());
drop policy if exists ecommerce_products_admin_manage on public.ecommerce_products;
create policy ecommerce_products_admin_manage on public.ecommerce_products
for all to authenticated using (public.ecommerce_is_admin()) with check (public.ecommerce_is_admin());

drop policy if exists ecommerce_admins_self_or_admin_read on public.ecommerce_admins;
create policy ecommerce_admins_self_or_admin_read on public.ecommerce_admins
for select to authenticated using (user_id = (select auth.uid()) or public.ecommerce_is_admin());

drop policy if exists ecommerce_orders_customer_read on public.ecommerce_orders;
create policy ecommerce_orders_customer_read on public.ecommerce_orders
for select to authenticated using (user_id = (select auth.uid()) or public.ecommerce_is_admin());
drop policy if exists ecommerce_orders_admin_update on public.ecommerce_orders;
create policy ecommerce_orders_admin_update on public.ecommerce_orders
for update to authenticated using (public.ecommerce_is_admin()) with check (public.ecommerce_is_admin());

drop policy if exists ecommerce_order_items_customer_read on public.ecommerce_order_items;
create policy ecommerce_order_items_customer_read on public.ecommerce_order_items
for select to authenticated using (
  exists (select 1 from public.ecommerce_orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.ecommerce_is_admin()))
);

-- Orders must be placed through this RPC. It calculates prices from the database,
-- locks inventory rows, validates stock and decrements stock transactionally.
create or replace function public.create_ecommerce_order(
  p_customer_name text,
  p_phone text,
  p_shipping_address text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_item jsonb;
  v_product public.ecommerce_products%rowtype;
  v_product_id uuid;
  v_quantity integer;
begin
  if v_user_id is null then raise exception 'Please sign in before placing an order.'; end if;
  if p_customer_name is null or length(trim(p_customer_name)) not between 1 and 160 then raise exception 'Enter a valid full name.'; end if;
  if p_phone is null or length(trim(p_phone)) not between 8 and 30 then raise exception 'Enter a valid phone number.'; end if;
  if p_shipping_address is null or length(trim(p_shipping_address)) not between 8 and 1200 then raise exception 'Enter a complete shipping address.'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then raise exception 'Your cart is empty or contains too many line items.'; end if;

  -- Prevent duplicate product rows in a single request from bypassing stock checks.
  if exists (
    select 1 from jsonb_array_elements(p_items) e
    group by (e->>'product_id') having count(*) > 1
  ) then raise exception 'Cart contains duplicate product lines. Refresh your cart and try again.'; end if;

  -- Validate and price each item from the trusted database.
  for v_item in select value from jsonb_array_elements(p_items) loop
    begin v_product_id := (v_item->>'product_id')::uuid;
    exception when others then raise exception 'A cart item has an invalid product identifier.'; end;
    begin v_quantity := (v_item->>'quantity')::integer;
    exception when others then raise exception 'A cart item has an invalid quantity.'; end;
    if v_quantity is null or v_quantity < 1 or v_quantity > 100 then raise exception 'Product quantity must be between 1 and 100.'; end if;
    select * into v_product from public.ecommerce_products p where p.id = v_product_id and p.is_active = true for update;
    if not found then raise exception 'One of the products is no longer available. Refresh your cart.'; end if;
    if v_product.stock < v_quantity then raise exception 'Not enough stock for %.', v_product.name; end if;
    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  if v_subtotal < 2999 and v_subtotal > 0 then v_shipping := 149; end if;
  insert into public.ecommerce_orders(user_id, customer_name, phone, shipping_address, subtotal, shipping_fee, total)
  values (v_user_id, trim(p_customer_name), trim(p_phone), trim(p_shipping_address), v_subtotal, v_shipping, v_subtotal + v_shipping)
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    select * into v_product from public.ecommerce_products where id = v_product_id for update;
    update public.ecommerce_products set stock = stock - v_quantity where id = v_product_id;
    insert into public.ecommerce_order_items(order_id, product_id, product_name, quantity, unit_price, line_total)
    values (v_order_id, v_product.id, v_product.name, v_quantity, v_product.price, v_product.price * v_quantity);
  end loop;

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'subtotal', v_subtotal, 'shipping_fee', v_shipping, 'total', v_subtotal + v_shipping);
end;
$$;
revoke all on function public.create_ecommerce_order(text,text,text,jsonb) from public, anon;
grant execute on function public.create_ecommerce_order(text,text,text,jsonb) to authenticated;

grant select on public.ecommerce_products to anon, authenticated;
grant insert, update, delete on public.ecommerce_products to authenticated;
grant select on public.ecommerce_admins to authenticated;
grant select on public.ecommerce_orders to authenticated;
grant update (status) on public.ecommerce_orders to authenticated;
grant select on public.ecommerce_order_items to authenticated;

-- Demo catalog. Images are public Unsplash sample photography; replace with your licensed product images.
insert into public.ecommerce_products(name,slug,description,category,price,compare_at_price,image_jpg,stock,is_featured,is_active)
values
('Studio Headphones','studio-headphones','Immersive sound, soft-touch cushions and a beautifully balanced everyday listening experience.','Tech',6499,7999,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',12,true,true),
('Everyday Carry Pack','everyday-carry-pack','A lightweight, weather-resistant backpack made for commutes, weekends and everywhere between.','Lifestyle',3299,null,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',9,true,true),
('Minimal Desk Lamp','minimal-desk-lamp','Warm, considered lighting for focused work and slower evenings.','Home',2199,2799,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85',15,false,true),
('Modern Timepiece','modern-timepiece','A clean dial, timeless silhouette and versatile everyday styling.','Lifestyle',4599,null,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85',7,true,true),
('Everyday Trainers','everyday-trainers','A versatile low-profile silhouette built for long days on the move.','Style',3899,4499,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',18,false,true),
('Ceramic Pour-over Set','ceramic-pour-over-set','A simple ritual, thoughtful form and a beautifully brewed cup at home.','Home',1699,null,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85',20,false,true)
on conflict(slug) do update set name=excluded.name, description=excluded.description, category=excluded.category, price=excluded.price, compare_at_price=excluded.compare_at_price, image_jpg=excluded.image_jpg, is_active=true;

commit;
