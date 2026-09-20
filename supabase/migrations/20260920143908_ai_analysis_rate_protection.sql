create table private.ai_analysis_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_count smallint not null check (image_count between 1 and 6),
  created_at timestamptz not null default now()
);
create index ai_analysis_requests_user_created_idx on private.ai_analysis_requests (user_id, created_at desc);
revoke all on table private.ai_analysis_requests from public, anon, authenticated;

create or replace function public.claim_ai_analysis_request(p_image_count integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_user uuid := (select auth.uid());
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_image_count < 1 or p_image_count > 6 then raise exception 'Between 1 and 6 images are required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  if (select count(*) from private.ai_analysis_requests r where r.user_id = v_user and r.created_at > now() - interval '1 hour') >= 10 then return false; end if;
  insert into private.ai_analysis_requests (user_id, image_count) values (v_user, p_image_count);
  return true;
end;
$$;
revoke all on function public.claim_ai_analysis_request(integer) from public, anon;
grant execute on function public.claim_ai_analysis_request(integer) to authenticated;
comment on function public.claim_ai_analysis_request(integer) is 'Atomically claims one authenticated OfferMe listing-analysis request, limited to 10 per rolling hour.';
