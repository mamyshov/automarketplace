-- CarBridge — initial schema
--
-- Plain Postgres + Supabase Auth/Storage. No proprietary Supabase Cloud
-- features (no vendor-locked Edge Functions in this file) so this migration
-- runs unchanged against a self-hosted Supabase stack (Phase 3, borneo.kg).
--
-- Apply with the Supabase CLI: `supabase db push` (or `psql` directly).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — one row per auth.users identity. Created automatically by a
-- trigger on signup (see handle_new_user below), never inserted by the app.
-- Created before is_admin() below, which references it — a `language sql`
-- function has its body's table references resolved at CREATE FUNCTION time,
-- unlike plpgsql, so the referenced table must already exist.
-- ---------------------------------------------------------------------------
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'buyer' check (role in ('buyer', 'seller', 'dealer', 'admin')),
  name       text,
  phone      text,
  whatsapp   text,
  telegram   text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: is the current request authenticated as an admin?
-- security definer so it can read public.users regardless of the caller's
-- own row-level access, without recursing through RLS on public.users.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Only an admin may change someone's role (prevents self-promotion via a
-- plain UPDATE that RLS would otherwise allow on the owner's own row).
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'only an admin can change role';
  end if;
  return new;
end;
$$;

create trigger users_prevent_role_escalation
  before update on public.users
  for each row execute procedure public.prevent_role_escalation();

alter table public.users enable row level security;

create policy "users select own or admin"
  on public.users for select
  using (id = auth.uid() or public.is_admin());

create policy "users update own or admin"
  on public.users for update
  using (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- dealers — company profiles. A dealer's listings show a "Проверенный
-- поставщик" style badge when verified = true (admin-controlled).
-- ---------------------------------------------------------------------------
create table public.dealers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  region      text,
  verified    boolean not null default false,
  rating      numeric(3, 2) not null default 0,
  phone       text,
  whatsapp    text,
  telegram    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.dealers enable row level security;

create policy "dealers public read" on public.dealers for select using (true);

create policy "dealers manage own or admin" on public.dealers for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- brands / models — reference lists for form autocomplete & filters.
-- Listings themselves store brand/model as free text (a lot may not be in
-- the catalog yet — "произвольный ввод, если модели нет в справочнике").
-- ---------------------------------------------------------------------------
create table public.brands (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.models (
  id       uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name     text not null,
  slug     text not null,
  unique (brand_id, slug)
);

alter table public.brands enable row level security;
alter table public.models enable row level security;

create policy "brands public read" on public.brands for select using (true);
create policy "brands admin write" on public.brands for insert with check (public.is_admin());
create policy "brands admin update" on public.brands for update using (public.is_admin());
create policy "brands admin delete" on public.brands for delete using (public.is_admin());

create policy "models public read" on public.models for select using (true);
create policy "models admin write" on public.models for insert with check (public.is_admin());
create policy "models admin update" on public.models for update using (public.is_admin());
create policy "models admin delete" on public.models for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------
create table public.listings (
  id                 uuid primary key default gen_random_uuid(),
  dealer_id          uuid references public.dealers(id) on delete set null,
  user_id            uuid not null references public.users(id) on delete cascade,
  market             text not null check (market in ('bishkek', 'china')),
  brand              text not null,
  model              text not null,
  year               int not null check (year between 1970 and 2100),
  mileage            int check (mileage >= 0),
  body_type          text,
  transmission       text,
  fuel               text,
  engine_volume      numeric(4, 1),
  color              text,
  vin                text,
  -- price_origin: price in China (USD). price_final: estimated all-in price
  -- delivered to Bishkek (USD). For market = 'bishkek' only price_final is used.
  price_origin       numeric(12, 2),
  price_final        numeric(12, 2) not null,
  status             text not null default 'in_china'
                        check (status in ('available', 'in_transit', 'in_china', 'on_order', 'sold')),
  moderation_status  text not null default 'pending'
                        check (moderation_status in ('pending', 'approved', 'rejected')),
  is_verified        boolean not null default false,
  verified_at        timestamptz,
  verified_note      text,
  description        text,
  location            text,
  views_count        int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index listings_market_idx on public.listings (market);
create index listings_status_idx on public.listings (status);
create index listings_moderation_idx on public.listings (moderation_status);
create index listings_brand_model_idx on public.listings (brand, model);
create index listings_user_idx on public.listings (user_id);
create index listings_dealer_idx on public.listings (dealer_id);
create index listings_price_idx on public.listings (price_final);

-- Only an admin may flip moderation_status / is_verified — a seller editing
-- their own listing should not be able to self-approve or self-verify.
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
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_protect_admin_fields
  before update on public.listings
  for each row execute procedure public.protect_listing_admin_fields();

alter table public.listings enable row level security;

-- Public can see approved listings (of any sale status, including "sold" —
-- the app hides sold listings from default catalog queries but keeps the
-- page live for SEO/history, per spec 5.2). Owners and admins see everything.
create policy "listings public read approved" on public.listings for select
  using (moderation_status = 'approved' or user_id = auth.uid() or public.is_admin());

-- A listing's dealer_id is a claim of "this is company X's listing" — must
-- be null or a dealer the caller actually owns, otherwise anyone could
-- attribute their listing to someone else's company via a direct insert/
-- update against the anon key (bypassing the app's own server-action check).
create or replace function public.owns_dealer_or_null(p_dealer_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select p_dealer_id is null or exists (
    select 1 from public.dealers d where d.id = p_dealer_id and d.user_id = auth.uid()
  );
$$;

create policy "listings insert own" on public.listings for insert
  with check (user_id = auth.uid() and public.owns_dealer_or_null(dealer_id));

create policy "listings update own or admin" on public.listings for update
  using (user_id = auth.uid() or public.is_admin())
  with check (public.is_admin() or public.owns_dealer_or_null(dealer_id));

create policy "listings delete own or admin" on public.listings for delete
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- listing_photos / listing_videos
-- ---------------------------------------------------------------------------
create table public.listing_photos (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url        text not null,
  position   int not null default 0,
  created_at timestamptz not null default now()
);

create table public.listing_videos (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url        text not null,
  created_at timestamptz not null default now()
);

create index listing_photos_listing_idx on public.listing_photos (listing_id, position);
create index listing_videos_listing_idx on public.listing_videos (listing_id);

alter table public.listing_photos enable row level security;
alter table public.listing_videos enable row level security;

create policy "listing_photos read" on public.listing_photos for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.moderation_status = 'approved' or l.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "listing_photos manage own or admin" on public.listing_photos for all
  using (
    exists (select 1 from public.listings l where l.id = listing_id and (l.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and (l.user_id = auth.uid() or public.is_admin()))
  );

create policy "listing_videos read" on public.listing_videos for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.moderation_status = 'approved' or l.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "listing_videos manage own or admin" on public.listing_videos for all
  using (
    exists (select 1 from public.listings l where l.id = listing_id and (l.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and (l.user_id = auth.uid() or public.is_admin()))
  );

-- ---------------------------------------------------------------------------
-- calculator_rates — admin-editable logistics/customs/broker rates, keyed by
-- vehicle bracket. Never hardcoded in the calculator UI (spec 5.3).
-- ---------------------------------------------------------------------------
create table public.calculator_rates (
  id                 uuid primary key default gen_random_uuid(),
  body_type          text not null,
  engine_volume_from numeric(4, 1) not null default 0,
  engine_volume_to   numeric(4, 1) not null default 99,
  year_from          int not null,
  year_to            int not null,
  logistics_fee      numeric(12, 2) not null,
  broker_fee         numeric(12, 2) not null,
  -- Flat customs duty for this bracket (USD). customs_formula is a
  -- human-readable note documenting how the duty was derived (e.g. rate per
  -- cc, age coefficient) for admin transparency/audit — the app reads
  -- customs_duty directly rather than evaluating a formula at runtime.
  customs_duty       numeric(12, 2) not null,
  customs_formula    text,
  currency           text not null default 'USD',
  is_active          boolean not null default true,
  updated_at         timestamptz not null default now()
);

create index calculator_rates_lookup_idx
  on public.calculator_rates (body_type, year_from, year_to, engine_volume_from, engine_volume_to);

alter table public.calculator_rates enable row level security;

create policy "calculator_rates public read" on public.calculator_rates for select using (is_active or public.is_admin());
create policy "calculator_rates admin write" on public.calculator_rates for insert with check (public.is_admin());
create policy "calculator_rates admin update" on public.calculator_rates for update using (public.is_admin());
create policy "calculator_rates admin delete" on public.calculator_rates for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- leads — calculator / budget-picker / listing-page lead capture.
-- ---------------------------------------------------------------------------
create table public.leads (
  id                   uuid primary key default gen_random_uuid(),
  source               text not null check (source in ('calculator', 'budget', 'listing')),
  listing_id           uuid references public.listings(id) on delete set null,
  brand                text,
  model                text,
  year                 int,
  budget               numeric(12, 2),
  name                 text not null,
  contact              text not null,
  contact_channel      text not null default 'whatsapp' check (contact_channel in ('whatsapp', 'telegram', 'phone')),
  -- Snapshot of the calculator breakdown shown to the lead, if any (source = 'calculator').
  calculator_breakdown jsonb,
  status               text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  notified_at          timestamptz,
  created_at           timestamptz not null default now()
);

create index leads_created_idx on public.leads (created_at desc);
create index leads_listing_idx on public.leads (listing_id);
create index leads_status_idx on public.leads (status);

alter table public.leads enable row level security;

-- Anyone (including anonymous visitors) may submit a lead. Rate limiting on
-- top of this is enforced in the app layer (see src/lib/rate-limit.ts).
create policy "leads public insert" on public.leads for insert with check (true);

create policy "leads read own listing or admin" on public.leads for select
  using (
    public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

create policy "leads update own listing or admin" on public.leads for update
  using (
    public.is_admin()
    or exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- subscriptions — tariff/plan state. MVP payment confirmation is manual
-- (admin flips status after checking a bank transfer/receipt).
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.users(id) on delete cascade,
  dealer_id    uuid references public.dealers(id) on delete cascade,
  plan         text not null check (plan in ('free', 'pro', 'top', 'dealer')),
  status       text not null default 'pending' check (status in ('pending', 'active', 'expired', 'rejected')),
  payment_note text,
  started_at   timestamptz,
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  check (user_id is not null or dealer_id is not null)
);

alter table public.subscriptions enable row level security;

create policy "subscriptions read own or admin" on public.subscriptions for select
  using (
    public.is_admin()
    or user_id = auth.uid()
    or exists (select 1 from public.dealers d where d.id = dealer_id and d.user_id = auth.uid())
  );

-- A user/dealer may request a plan for themselves (status always starts
-- 'pending' — only an admin can activate it, see the update policy below).
create policy "subscriptions self request" on public.subscriptions for insert
  with check (
    status = 'pending'
    and (
      (user_id = auth.uid() and dealer_id is null)
      or exists (select 1 from public.dealers d where d.id = dealer_id and d.user_id = auth.uid())
    )
  );

create policy "subscriptions admin write" on public.subscriptions for insert with check (public.is_admin());
create policy "subscriptions admin update" on public.subscriptions for update using (public.is_admin());
create policy "subscriptions admin delete" on public.subscriptions for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- countries — groundwork for multi-country expansion (spec 7 / 11 Этап 4).
-- ---------------------------------------------------------------------------
create table public.countries (
  id        uuid primary key default gen_random_uuid(),
  code      text not null unique,
  name      text not null,
  currency  text not null,
  is_active boolean not null default false
);

alter table public.countries enable row level security;

create policy "countries public read" on public.countries for select using (true);
create policy "countries admin write" on public.countries for insert with check (public.is_admin());
create policy "countries admin update" on public.countries for update using (public.is_admin());
create policy "countries admin delete" on public.countries for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- static_pages — CMS-lite content for "Как купить", "Доставка", "Таможня",
-- "О площадке", edited from admin without touching code (spec 5.3 / 5.8).
-- ---------------------------------------------------------------------------
create table public.static_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  locale      text not null default 'ru',
  title       text not null,
  content_md  text not null default '',
  updated_at  timestamptz not null default now(),
  unique (slug, locale)
);

alter table public.static_pages enable row level security;

create policy "static_pages public read" on public.static_pages for select using (true);
create policy "static_pages admin write" on public.static_pages for insert with check (public.is_admin());
create policy "static_pages admin update" on public.static_pages for update using (public.is_admin());
create policy "static_pages admin delete" on public.static_pages for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- app_settings — small key/value config store (USD/KGS rate, contact info…),
-- admin-editable, never hardcoded (spec 7).
-- ---------------------------------------------------------------------------
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "app_settings public read" on public.app_settings for select using (true);
create policy "app_settings admin write" on public.app_settings for insert with check (public.is_admin());
create policy "app_settings admin update" on public.app_settings for update using (public.is_admin());
create policy "app_settings admin delete" on public.app_settings for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reviews — schema included per spec 6 (optional for MVP, no UI yet).
-- ---------------------------------------------------------------------------
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  dealer_id  uuid not null references public.dealers(id) on delete cascade,
  author     text not null,
  rating     int not null check (rating between 1 and 5),
  text       text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews public read" on public.reviews for select using (true);
create policy "reviews insert authenticated" on public.reviews for insert with check (auth.uid() is not null);
create policy "reviews admin delete" on public.reviews for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- analytics_events — lightweight lead-funnel event log (spec 9): calculator
-- opened/submitted, WhatsApp/Telegram click-through, etc.
-- ---------------------------------------------------------------------------
create table public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  event_name text not null,
  payload    jsonb not null default '{}',
  session_id text,
  created_at timestamptz not null default now()
);

create index analytics_events_name_idx on public.analytics_events (event_name, created_at desc);

alter table public.analytics_events enable row level security;

create policy "analytics_events public insert" on public.analytics_events for insert with check (true);
create policy "analytics_events admin read" on public.analytics_events for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- View-count increment helper — bypasses RLS's update-own-listing check so a
-- casual page view (any visitor) can bump the counter on someone else's
-- approved listing without granting broader update rights.
-- ---------------------------------------------------------------------------
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.listings
  set views_count = views_count + 1
  where id = p_listing_id and moderation_status = 'approved';
$$;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
