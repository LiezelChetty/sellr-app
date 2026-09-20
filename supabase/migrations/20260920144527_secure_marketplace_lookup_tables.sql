alter table public.marketplaces enable row level security;
alter table public.marketplace_regions enable row level security;

revoke all on table public.marketplaces from anon, authenticated;
revoke all on table public.marketplace_regions from anon, authenticated;
grant select on table public.marketplaces to anon, authenticated;
grant select on table public.marketplace_regions to anon, authenticated;

create policy "active marketplaces are public"
on public.marketplaces for select to anon, authenticated
using (active = true);

create policy "enabled marketplace regions are public"
on public.marketplace_regions for select to anon, authenticated
using (enabled = true);
