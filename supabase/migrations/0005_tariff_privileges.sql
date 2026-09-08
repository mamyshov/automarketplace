-- Makes the tariffs from spec §5.7 actually do something, instead of just
-- being requestable/confirmable with no effect once active:
--   - free: 5 active listings (already enforced before this migration)
--   - pro: 30 active listings
--   - dealer: unlimited listings for that dealer's own profile
--   - top: one-off paid promotion of a single listing ("разовое
--     продвижение"), not an account-wide plan — so subscriptions gets an
--     optional listing_id to say *which* listing a 'top' request is for.

alter table public.listings
  add column if not exists is_top boolean not null default false;

alter table public.subscriptions
  add column if not exists listing_id uuid references public.listings(id) on delete cascade;

-- Only meaningful for plan = 'top'; enforced at the app layer, not a CHECK
-- constraint, so existing 'pro'/'dealer' rows (listing_id null) stay valid.

-- ---------------------------------------------------------------------------
-- A subscription's listing_id is a claim of "promote *my* listing" — must be
-- null or a listing the caller actually owns, same reasoning as
-- owns_dealer_or_null for listings.dealer_id (0001_init.sql).
-- ---------------------------------------------------------------------------
create or replace function public.owns_listing_or_null(p_listing_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select p_listing_id is null or exists (
    select 1 from public.listings l where l.id = p_listing_id and l.user_id = auth.uid()
  );
$$;

drop policy if exists "subscriptions self request" on public.subscriptions;

create policy "subscriptions self request" on public.subscriptions for insert
  with check (
    status = 'pending'
    and public.owns_listing_or_null(listing_id)
    and (
      (user_id = auth.uid() and dealer_id is null)
      or exists (select 1 from public.dealers d where d.id = dealer_id and d.user_id = auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Only an admin may flip is_top (mirrors the existing guard on
-- moderation_status/is_verified/verified_* in protect_listing_admin_fields).
-- ---------------------------------------------------------------------------
create or replace function public.protect_listing_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.moderation_status <> old.moderation_status then
      raise exception 'only an admin can change moderation_status';
    end if;
    if new.is_verified <> old.is_verified then
      raise exception 'only an admin can change is_verified';
    end if;
    if new.verified_note is distinct from old.verified_note then
      raise exception 'only an admin can change verified_note';
    end if;
    if new.verified_by_name is distinct from old.verified_by_name then
      raise exception 'only an admin can change verified_by_name';
    end if;
    if new.verified_at is distinct from old.verified_at then
      raise exception 'only an admin can change verified_at';
    end if;
    if new.is_top <> old.is_top then
      raise exception 'only an admin can change is_top';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists listings_is_top_idx on public.listings (is_top);
