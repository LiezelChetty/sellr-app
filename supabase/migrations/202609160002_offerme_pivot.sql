-- OfferMe pivot: local marketplace domain. Apply after the initial foundation migration.
alter type public.listing_status add value if not exists 'OFFER_ACCEPTED';
alter type public.listing_status add value if not exists 'ARCHIVED';
alter type public.listing_status add value if not exists 'SOLD';

alter table public.master_listings rename to listings;
alter table public.sales rename to completed_sales;
alter table public.profiles add column if not exists approximate_location text;
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles add column if not exists member_since timestamptz not null default now();
alter table public.listings add column if not exists asking_price numeric(12,2);
alter table public.listings add column if not exists approximate_location text;
alter table public.listings add column if not exists tags text[] not null default '{}';

create table public.clearout_sales (
  id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, description text not null default '', approximate_location text not null,
  cover_photo_id uuid, status text not null default 'DRAFT' check(status in ('DRAFT','LIVE','ENDED')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.listings add column if not exists clearout_sale_id uuid references public.clearout_sales(id) on delete set null;

create type public.offer_status as enum ('PENDING','ACCEPTED','DECLINED','COUNTERED','WITHDRAWN','EXPIRED');
create table public.offers (
  id uuid primary key default gen_random_uuid(), listing_ids uuid[] not null check(cardinality(listing_ids)>0),
  buyer_id uuid not null references public.profiles(id) on delete cascade, seller_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check(amount>0), currency text not null, status public.offer_status not null default 'PENDING',
  message text, parent_offer_id uuid references public.offers(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(buyer_id<>seller_id)
);
create table public.conversations (
  id uuid primary key default gen_random_uuid(), listing_id uuid references public.listings(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, joined_at timestamptz not null default now(),
  primary key(conversation_id,user_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade, body text not null check(char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(), edited_at timestamptz
);
create table public.favourites (
  user_id uuid not null references public.profiles(id) on delete cascade, listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id,listing_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check(target_type in ('LISTING','USER')), target_id uuid not null, reason text not null,
  status text not null default 'OPEN' check(status in ('OPEN','REVIEWING','RESOLVED','DISMISSED')), created_at timestamptz not null default now()
);
create table public.blocked_users (
  blocker_id uuid not null references public.profiles(id) on delete cascade, blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);

alter table public.clearout_sales enable row level security; alter table public.offers enable row level security;
alter table public.conversations enable row level security; alter table public.conversation_members enable row level security;
alter table public.messages enable row level security; alter table public.favourites enable row level security;
alter table public.reports enable row level security; alter table public.blocked_users enable row level security;

create policy "public profiles are discoverable" on public.profiles for select using (true);
create policy "live listings are discoverable" on public.listings for select using (status='LIVE' or user_id=auth.uid());
create policy "live clearout sales are discoverable" on public.clearout_sales for select using (status='LIVE' or seller_id=auth.uid());
create policy "seller manages clearout sales" on public.clearout_sales for all using(seller_id=auth.uid()) with check(seller_id=auth.uid());
create policy "offer parties can read" on public.offers for select using(auth.uid() in (buyer_id,seller_id));
create policy "buyer creates offers" on public.offers for insert with check(buyer_id=auth.uid());
create policy "offer parties can update" on public.offers for update using(auth.uid() in (buyer_id,seller_id));
create policy "members see memberships" on public.conversation_members for select using(user_id=auth.uid());
create policy "users join conversations" on public.conversation_members for insert with check(user_id=auth.uid());
create or replace function public.is_conversation_member(cid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.conversation_members where conversation_id=cid and user_id=auth.uid()) $$;
create policy "members read conversations" on public.conversations for select using(public.is_conversation_member(id));
create policy "authenticated create conversations" on public.conversations for insert to authenticated with check(true);
create policy "members read messages" on public.messages for select using(public.is_conversation_member(conversation_id));
create policy "members send own messages" on public.messages for insert with check(sender_id=auth.uid() and public.is_conversation_member(conversation_id));
create policy "own favourites" on public.favourites for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "submit own reports" on public.reports for insert with check(reporter_id=auth.uid());
create policy "read own reports" on public.reports for select using(reporter_id=auth.uid());
create policy "own blocks" on public.blocked_users for all using(blocker_id=auth.uid()) with check(blocker_id=auth.uid());

comment on table public.clearout_sales is 'Public grouped garage-sale/clear-out collections. Not completed transactions.';
comment on table public.completed_sales is 'Seller-recorded outcomes; not proof of payment or handover.';
comment on column public.listings.approximate_location is 'Town/city/county only. Never a street or exact address.';
comment on column public.offers.listing_ids is 'Array supports future bundle offers; current client sends one listing.';
