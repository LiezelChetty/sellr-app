-- SELLR V1 foundation. Apply through the Supabase CLI after creating a project.
create extension if not exists "pgcrypto";

create type public.listing_status as enum ('DRAFT','READY','LIVE','SOLD','ARCHIVED');
create type public.connection_status as enum ('NOT_SETUP','PENDING','CONNECTED','EXPIRED','REVOKED','ERROR');
create type public.credit_transaction_type as enum ('GRANT','PURCHASE','USE','REFUND','ADJUSTMENT');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  country_code text not null default 'IE' check (char_length(country_code)=2),
  clear_out_categories text[] not null default '{}', notifications_enabled boolean not null default true,
  onboarding_completed boolean not null default false, updated_at timestamptz not null default now()
);
create table public.marketplaces (
  id text primary key, name text not null, capabilities text[] not null default '{}', active boolean not null default true,
  official_developer_url text, created_at timestamptz not null default now()
);
create table public.marketplace_regions (
  marketplace_id text not null references public.marketplaces(id) on delete cascade,
  country_code text not null check (char_length(country_code)=2), enabled boolean not null default false,
  handoff_url text, primary key (marketplace_id,country_code)
);
create table public.marketplace_connections (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  marketplace_id text not null references public.marketplaces(id), status public.connection_status not null default 'NOT_SETUP',
  provider_account_id text, token_reference text, -- reference to encrypted server-side secret storage; never a password/token
  scopes text[] not null default '{}', expires_at timestamptz, last_refreshed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,marketplace_id)
);
create table public.master_listings (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, brand text, category text, subcategory text, size text, condition text, colour text,
  description text not null default '', suggested_price_low numeric(12,2), suggested_price_high numeric(12,2),
  recommended_price numeric(12,2), currency text not null default 'EUR', analysis_confidence numeric(4,3),
  analysis_source text not null default 'manual', status public.listing_status not null default 'DRAFT',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.listing_photos (
  id uuid primary key default gen_random_uuid(), master_listing_id uuid not null references public.master_listings(id) on delete cascade,
  original_storage_path text not null, display_storage_path text, sort_order integer not null default 0,
  created_at timestamptz not null default now(), unique(master_listing_id,sort_order)
);
create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(), master_listing_id uuid not null references public.master_listings(id) on delete cascade,
  marketplace_id text not null references public.marketplaces(id), connection_id uuid references public.marketplace_connections(id) on delete set null,
  title text not null, description text not null default '', price numeric(12,2), category text, tags text[] not null default '{}',
  photo_order uuid[] not null default '{}', marketplace_notes text, status public.listing_status not null default 'DRAFT',
  external_listing_id text, external_url text, last_confirmed_at timestamptz, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique(master_listing_id,marketplace_id)
);
create table public.sales (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  master_listing_id uuid not null unique references public.master_listings(id), marketplace_id text references public.marketplaces(id),
  sale_price numeric(12,2) not null check(sale_price>=0), currency text not null, notes text, sold_at timestamptz not null default now()
);
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  type public.credit_transaction_type not null, amount integer not null, reference text, created_at timestamptz not null default now()
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null, provider text, provider_customer_id text, provider_subscription_id text,
  status text not null, current_period_end timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security; alter table public.user_preferences enable row level security;
alter table public.marketplace_connections enable row level security; alter table public.master_listings enable row level security;
alter table public.listing_photos enable row level security; alter table public.marketplace_listings enable row level security;
alter table public.sales enable row level security; alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid()=id) with check(auth.uid()=id);
create policy "own preferences" on public.user_preferences for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own connections" on public.marketplace_connections for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own master listings" on public.master_listings for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own photos" on public.listing_photos for all using (exists(select 1 from public.master_listings m where m.id=master_listing_id and m.user_id=auth.uid())) with check (exists(select 1 from public.master_listings m where m.id=master_listing_id and m.user_id=auth.uid()));
create policy "own marketplace listings" on public.marketplace_listings for all using (exists(select 1 from public.master_listings m where m.id=master_listing_id and m.user_id=auth.uid())) with check (exists(select 1 from public.master_listings m where m.id=master_listing_id and m.user_id=auth.uid()));
create policy "own sales" on public.sales for all using (auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "own credits" on public.credit_transactions for select using (auth.uid()=user_id);
create policy "own subscriptions" on public.subscriptions for select using (auth.uid()=user_id);

insert into public.marketplaces(id,name,capabilities) values
('vinted','Vinted',array['PREPARE_ONLY','HANDOFF']),('donedeal','DoneDeal',array['PREPARE_ONLY','HANDOFF']),
('facebook','Facebook Marketplace',array['PREPARE_ONLY','HANDOFF']),('ebay','eBay',array['PREPARE_ONLY','OAUTH_AVAILABLE'])
on conflict do nothing;
insert into public.marketplace_regions(marketplace_id,country_code,enabled) values
('vinted','IE',true),('donedeal','IE',true),('facebook','IE',true),('ebay','IE',true),
('vinted','GB',true),('facebook','GB',true),('ebay','GB',true),('facebook','ZA',true),
('facebook','US',true),('ebay','US',true),('facebook','AU',true),('ebay','AU',true)
on conflict do nothing;
