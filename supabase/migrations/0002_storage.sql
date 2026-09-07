-- Storage bucket for listing photos/videos. Public read (listing media needs
-- to be viewable without auth), writes restricted to the listing's owner
-- (folder-per-listing convention: `<listing_id>/<file>`, enforced by policy
-- on foldername(name)[1] matching a listing the caller owns).

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true)
on conflict (id) do nothing;

create policy "listing-media public read"
  on storage.objects for select
  using (bucket_id = 'listing-media');

create policy "listing-media owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-media'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and (l.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "listing-media owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-media'
    and exists (
      select 1 from public.listings l
      where l.id::text = (storage.foldername(name))[1]
        and (l.user_id = auth.uid() or public.is_admin())
    )
  );

-- Dealer logos — public read, dealer-owner write, folder-per-dealer.
insert into storage.buckets (id, name, public)
values ('dealer-media', 'dealer-media', true)
on conflict (id) do nothing;

create policy "dealer-media public read"
  on storage.objects for select
  using (bucket_id = 'dealer-media');

create policy "dealer-media owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'dealer-media'
    and exists (
      select 1 from public.dealers d
      where d.id::text = (storage.foldername(name))[1]
        and (d.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "dealer-media owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'dealer-media'
    and exists (
      select 1 from public.dealers d
      where d.id::text = (storage.foldername(name))[1]
        and (d.user_id = auth.uid() or public.is_admin())
    )
  );
