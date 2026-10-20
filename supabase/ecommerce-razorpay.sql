-- Run AFTER ecommerce-schema.sql, in the STORE Supabase project only.
begin;

alter table public.ecommerce_orders
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','failed')),
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists paid_at timestamptz;

-- Public image bucket for product photos. Only store admins can upload/change/delete.
insert into storage.buckets (id, name, public) values ('product-images','product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write" on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and public.ecommerce_is_admin())
  with check (bucket_id = 'product-images' and public.ecommerce_is_admin());

-- Used by the Edge Functions (service role only): cancel an unpaid order and put stock back.
create or replace function public.ecommerce_fail_order(p_order_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  update public.ecommerce_orders set payment_status='failed', status='cancelled'
  where id = p_order_id and payment_status = 'unpaid';
  if found then
    for r in select product_id, quantity from public.ecommerce_order_items where order_id = p_order_id loop
      update public.ecommerce_products set stock = stock + r.quantity where id = r.product_id;
    end loop;
  end if;
end $$;
revoke all on function public.ecommerce_fail_order(uuid) from public, anon, authenticated;
grant execute on function public.ecommerce_fail_order(uuid) to service_role;

commit;
