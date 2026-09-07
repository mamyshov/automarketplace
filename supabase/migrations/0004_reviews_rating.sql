-- Dealer reviews UI (spec §5.5): reviews.rating average now feeds
-- dealers.rating automatically, so the "★ X.X" shown on the dealer card/page
-- reflects real reviews instead of a manually-set number that nothing else
-- writes to.

create or replace function public.recalc_dealer_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_dealer_id uuid := coalesce(new.dealer_id, old.dealer_id);
begin
  update public.dealers
  set rating = coalesce(
    (select round(avg(rating)::numeric, 2) from public.reviews where dealer_id = affected_dealer_id),
    0
  )
  where id = affected_dealer_id;
  return null;
end;
$$;

create trigger reviews_recalc_dealer_rating
  after insert or update of rating or delete on public.reviews
  for each row execute procedure public.recalc_dealer_rating();
