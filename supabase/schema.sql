-- Supabase schema for Personal Finance Dashboard
-- Creates a per-user JSON storage table and secure RLS policies.

create table if not exists public.pf_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Helpful index when querying by user (though PK already covers it)
create index if not exists pf_data_user_id_idx on public.pf_data(user_id);

-- Enable Row Level Security
alter table public.pf_data enable row level security;

-- Policies: only the owner (auth.uid()) can select/insert/update/delete their record
drop policy if exists "pf_data_select_own" on public.pf_data;
create policy "pf_data_select_own" on public.pf_data
for select using (auth.uid() = user_id);

drop policy if exists "pf_data_insert_own" on public.pf_data;
create policy "pf_data_insert_own" on public.pf_data
for insert with check (auth.uid() = user_id);

drop policy if exists "pf_data_update_own" on public.pf_data;
create policy "pf_data_update_own" on public.pf_data
for update using (auth.uid() = user_id);

drop policy if exists "pf_data_delete_own" on public.pf_data;
create policy "pf_data_delete_own" on public.pf_data
for delete using (auth.uid() = user_id);
