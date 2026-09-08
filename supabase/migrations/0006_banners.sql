-- banners — the 5th monetization tier from the spec (баннерная реклама),
-- not modeled until now. MVP: manual approval like the other tariffs, one
-- ad slot per placement (the most recently activated banner wins — no
-- rotation/carousel), no real payment.

create table public.banners (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  title      text not null,
  link_url   text not null,
  image_url  text,
  placement  text not null check (placement in ('home_top', 'catalog_top', 'china_top')),
  status     text not null default 'pending' check (status in ('pending', 'active', 'expired', 'rejected')),
  starts_at  timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.banners enable row level security;

-- Active banners are public (they're rendered on public pages); a
-- pending/rejected/expired one is visible only to its own requester or an
-- admin, same visibility shape as subscriptions.
create policy "banners read active or own or admin" on public.banners for select
  using (status = 'active' or user_id = auth.uid() or public.is_admin());

-- A user requests a banner for themselves; only an admin can activate it
-- (see the admin update policy below) — mirrors "subscriptions self request".
create policy "banners self request" on public.banners for insert
  with check (status = 'pending' and user_id = auth.uid());

create policy "banners admin update" on public.banners for update using (public.is_admin());
create policy "banners admin delete" on public.banners for delete using (public.is_admin());

create or replace function public.set_banners_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger banners_set_updated_at
  before update on public.banners
  for each row execute procedure public.set_banners_updated_at();

create index banners_placement_status_idx on public.banners (placement, status);

-- ---------------------------------------------------------------------------
-- Storage bucket for banner images. Public read; upload/delete restricted to
-- the uploader's own folder (`<user_id>/<file>`) — unlike listing/dealer
-- media, this is keyed by the uploader rather than the banner row, since the
-- image is uploaded as part of submitting the request, before the row (and
-- its id) exists.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('banner-media', 'banner-media', true)
on conflict (id) do nothing;

create policy "banner-media public read"
  on storage.objects for select
  using (bucket_id = 'banner-media');

create policy "banner-media owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'banner-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "banner-media owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'banner-media'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
