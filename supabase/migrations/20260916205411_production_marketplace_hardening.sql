-- Production hardening for OfferMe's authenticated local marketplace.
-- Additive migration: apply after 202609160001 and 202609160002.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.profiles add column if not exists country_code text;
alter table public.profiles add column if not exists region text;
alter table public.profiles add column if not exists town text;
alter table public.user_preferences add column if not exists region text;
alter table public.user_preferences add column if not exists town text;
alter table public.listings add column if not exists country_code text;
alter table public.listings add column if not exists region text;
alter table public.listings add column if not exists town text;
alter table public.clearout_sales add column if not exists country_code text;
alter table public.clearout_sales add column if not exists region text;
alter table public.clearout_sales add column if not exists town text;
alter table public.offers add column if not exists last_actor_id uuid references public.profiles(id) on delete set null default auth.uid();
update public.offers set last_actor_id = buyer_id where last_actor_id is null;

alter table public.profiles drop constraint if exists profiles_country_code_check;
alter table public.profiles add constraint profiles_country_code_check
  check (country_code is null or country_code in ('IE','GB','ZA','US','AU'));
alter table public.listings drop constraint if exists listings_country_code_check;
alter table public.listings add constraint listings_country_code_check
  check (country_code is null or country_code in ('IE','GB','ZA','US','AU'));
alter table public.clearout_sales drop constraint if exists clearout_sales_country_code_check;
alter table public.clearout_sales add constraint clearout_sales_country_code_check
  check (country_code is null or country_code in ('IE','GB','ZA','US','AU'));

create index if not exists listings_discovery_idx
  on public.listings (country_code, region, status, created_at desc);
create index if not exists clearout_sales_discovery_idx
  on public.clearout_sales (country_code, region, status, created_at desc);
create index if not exists offers_buyer_idx on public.offers (buyer_id, updated_at desc);
create index if not exists offers_seller_idx on public.offers (seller_id, updated_at desc);
create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

-- Create an application profile automatically. Location is intentionally absent
-- until the user completes the broad-area onboarding flow.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id, display_name)
select u.id, nullif(trim(u.raw_user_meta_data ->> 'display_name'), '')
from auth.users u
on conflict (id) do nothing;
insert into public.user_preferences (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

-- Membership checks live outside the exposed API schema and cannot be invoked
-- directly through PostgREST.
drop function if exists public.is_conversation_member(uuid) cascade;
create or replace function private.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_conversation_member(uuid) from public, anon;
grant execute on function private.is_conversation_member(uuid) to authenticated;

drop policy if exists "members read conversations" on public.conversations;
create policy "members read conversations" on public.conversations
  for select to authenticated
  using ((select private.is_conversation_member(id)));
drop policy if exists "members see memberships" on public.conversation_members;
create policy "members see conversation participants" on public.conversation_members
  for select to authenticated
  using ((select private.is_conversation_member(conversation_id)));
drop policy if exists "members read messages" on public.messages;
create policy "members read messages" on public.messages
  for select to authenticated
  using ((select private.is_conversation_member(conversation_id)));
drop policy if exists "members send own messages" on public.messages;
create policy "members send own messages" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and (select private.is_conversation_member(conversation_id))
  );

-- Only this function may create a conversation and its two memberships. The
-- other party is derived from the listing, never trusted from client input.
drop policy if exists "authenticated create conversations" on public.conversations;
drop policy if exists "users join conversations" on public.conversation_members;
revoke insert on public.conversations from anon, authenticated;
revoke insert, update, delete on public.conversation_members from anon, authenticated;

create or replace function public.start_listing_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_seller uuid;
  v_conversation uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select l.user_id into v_seller
  from public.listings l
  where l.id = p_listing_id and (l.status = 'LIVE' or l.user_id = v_user);
  if v_seller is null then raise exception 'Listing unavailable'; end if;
  if v_seller = v_user then raise exception 'Cannot message yourself'; end if;

  select c.id into v_conversation
  from public.conversations c
  join public.conversation_members me on me.conversation_id = c.id and me.user_id = v_user
  join public.conversation_members seller on seller.conversation_id = c.id and seller.user_id = v_seller
  where c.listing_id = p_listing_id
  order by c.created_at
  limit 1;

  if v_conversation is null then
    insert into public.conversations (listing_id) values (p_listing_id)
    returning id into v_conversation;
    insert into public.conversation_members (conversation_id, user_id)
    values (v_conversation, v_user), (v_conversation, v_seller);
  end if;
  return v_conversation;
end;
$$;
revoke all on function public.start_listing_conversation(uuid) from public, anon;
grant execute on function public.start_listing_conversation(uuid) to authenticated;

-- Direct offer updates are forbidden. This RPC enforces the state machine and
-- which party may perform each transition.
drop policy if exists "offer parties can update" on public.offers;
revoke update on public.offers from anon, authenticated;
create or replace function public.transition_offer(
  p_offer_id uuid,
  p_action text,
  p_counter_amount numeric default null
)
returns public.offers
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_offer public.offers;
  v_status public.offer_status;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select * into v_offer from public.offers where id = p_offer_id for update;
  if v_offer.id is null then raise exception 'Offer not found'; end if;
  if v_offer.status not in ('PENDING','COUNTERED') then
    raise exception 'Offer can no longer be changed';
  end if;

  case upper(p_action)
    when 'ACCEPT' then
      if v_user not in (v_offer.buyer_id, v_offer.seller_id) or v_user = v_offer.last_actor_id then raise exception 'Only the receiving party can accept'; end if;
      v_status := 'ACCEPTED';
    when 'DECLINE' then
      if v_user not in (v_offer.buyer_id, v_offer.seller_id) or v_user = v_offer.last_actor_id then raise exception 'Only the receiving party can decline'; end if;
      v_status := 'DECLINED';
    when 'WITHDRAW' then
      if v_user <> v_offer.buyer_id then raise exception 'Only the buyer can withdraw'; end if;
      v_status := 'WITHDRAWN';
    when 'COUNTER' then
      if v_user not in (v_offer.buyer_id, v_offer.seller_id) then raise exception 'Not an offer party'; end if;
      if v_user = v_offer.last_actor_id then raise exception 'Wait for the other party to respond'; end if;
      if p_counter_amount is null or p_counter_amount <= 0 then raise exception 'Counter amount must be positive'; end if;
      v_status := 'COUNTERED';
    else raise exception 'Unsupported offer action';
  end case;

  update public.offers
  set status = v_status,
      amount = case when v_status = 'COUNTERED' then p_counter_amount else amount end,
      last_actor_id = v_user,
      updated_at = now()
  where id = p_offer_id
  returning * into v_offer;
  if v_status = 'ACCEPTED' then
    update public.listings
    set status = 'OFFER_ACCEPTED', updated_at = now()
    where id = v_offer.listing_ids[1] and user_id = v_offer.seller_id;
  end if;
  return v_offer;
end;
$$;
revoke all on function public.transition_offer(uuid,text,numeric) from public, anon;
grant execute on function public.transition_offer(uuid,text,numeric) to authenticated;

-- Restrict inserts to a live listing, its actual seller and the current buyer.
drop policy if exists "buyer creates offers" on public.offers;
create policy "buyer creates valid offers" on public.offers
  for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and last_actor_id = (select auth.uid())
    and seller_id <> (select auth.uid())
    and exists (
      select 1 from public.listings l
      where l.id = listing_ids[1]
        and l.user_id = seller_id
        and l.status = 'LIVE'
    )
  );

drop policy if exists "live listing photos are discoverable" on public.listing_photos;
create policy "live listing photos are discoverable" on public.listing_photos
  for select to anon, authenticated
  using (exists (
    select 1 from public.listings l
    where l.id = master_listing_id
      and (l.status = 'LIVE' or l.user_id = (select auth.uid()))
  ));

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;

-- Storage keeps original seller photos. A public bucket is intentional because
-- live marketplace photos are public; only the owner can write their UUID path.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos', 'listing-photos', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owners upload listing photos" on storage.objects;
create policy "owners upload listing photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "owners update listing photos" on storage.objects;
create policy "owners update listing photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'listing-photos' and owner_id = (select auth.uid()::text))
  with check (bucket_id = 'listing-photos' and owner_id = (select auth.uid()::text));
drop policy if exists "owners delete listing photos" on storage.objects;
create policy "owners delete listing photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-photos' and owner_id = (select auth.uid()::text));

comment on column public.profiles.region is 'Broad administrative area only; never a street address or coordinates.';
comment on column public.profiles.town is 'Broad town/city only; never a street address or coordinates.';
comment on function public.transition_offer(uuid,text,numeric) is 'Authoritative OfferMe offer state transition boundary.';
