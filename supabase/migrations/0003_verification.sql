-- Verification detail (spec §5.6): who inspected the car and when, plus
-- which of the listing's photos/videos are the diagnostic evidence — shown
-- in an expandable block on the listing page, distinct from the seller's
-- own listing photos.
--
-- This is an incremental migration on top of 0001/0002, which are already
-- applied to the live project — do not edit those files, add new ones.

alter table public.listings
  add column if not exists verified_by_name text;

alter table public.listing_photos
  add column if not exists is_verification boolean not null default false;

alter table public.listing_videos
  add column if not exists is_verification boolean not null default false;

-- Extend the existing admin-fields guard (0001_init.sql) to also cover the
-- new verification fields — without this, a seller could self-write
-- verified_note/verified_by_name (or leave stale values) via a direct
-- update against the anon key, since only moderation_status/is_verified
-- were previously protected.
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
  end if;
  new.updated_at = now();
  return new;
end;
$$;

-- listing_photos/listing_videos RLS ("manage own or admin", from 0001) lets
-- the owner update any column, including is_verification — that would let a
-- seller self-mark their own photo as verified diagnostic evidence. Guard
-- it the same way as the listings admin fields above.
create or replace function public.protect_photo_verification_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_verification <> old.is_verification and not public.is_admin() then
    raise exception 'only an admin can change is_verification';
  end if;
  return new;
end;
$$;

create trigger listing_photos_protect_verification
  before update on public.listing_photos
  for each row execute procedure public.protect_photo_verification_flag();

create trigger listing_videos_protect_verification
  before update on public.listing_videos
  for each row execute procedure public.protect_photo_verification_flag();
