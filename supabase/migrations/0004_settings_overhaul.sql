-- Settings overhaul: profile schedule/formality, BYOK provider keys,
-- idempotent scheduled check-in deliveries. Apply after 0003.
-- RLS: own-row for user tables. Ciphertext is never returned by app APIs.

alter table public.profiles
  add column if not exists formality text not null default 'ty';
alter table public.profiles
  add column if not exists schedule_enabled boolean not null default true;
alter table public.profiles
  add column if not exists daily_message_count integer not null default 1;
alter table public.profiles
  add column if not exists schedule_mode text not null default 'specific';
alter table public.profiles
  add column if not exists first_message_time text not null default '09:00';
alter table public.profiles
  add column if not exists timezone text;

alter table public.profiles
  drop constraint if exists profiles_formality_check;
alter table public.profiles
  add constraint profiles_formality_check
  check (formality in ('ty', 'vy'));

alter table public.profiles
  drop constraint if exists profiles_schedule_mode_check;
alter table public.profiles
  add constraint profiles_schedule_mode_check
  check (schedule_mode in ('specific', 'random'));

alter table public.profiles
  drop constraint if exists profiles_daily_message_count_check;
alter table public.profiles
  add constraint profiles_daily_message_count_check
  check (daily_message_count between 1 and 3);

-- Copy signup name from auth metadata when a profile is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create table if not exists public.user_provider_keys (
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('openrouter', 'elevenlabs')),
  ciphertext text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

alter table public.user_provider_keys enable row level security;

drop policy if exists "provider_keys_select_own" on public.user_provider_keys;
create policy "provider_keys_select_own"
  on public.user_provider_keys for select
  using (auth.uid() = user_id);

drop policy if exists "provider_keys_insert_own" on public.user_provider_keys;
create policy "provider_keys_insert_own"
  on public.user_provider_keys for insert
  with check (auth.uid() = user_id);

drop policy if exists "provider_keys_update_own" on public.user_provider_keys;
create policy "provider_keys_update_own"
  on public.user_provider_keys for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "provider_keys_delete_own" on public.user_provider_keys;
create policy "provider_keys_delete_own"
  on public.user_provider_keys for delete
  using (auth.uid() = user_id);

create table if not exists public.scheduled_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_at timestamptz not null,
  sent_at timestamptz not null default now(),
  unique (user_id, slot_at)
);

alter table public.scheduled_deliveries enable row level security;

-- Learners never read/write deliveries; the cron job uses the service role.
drop policy if exists "scheduled_deliveries_no_client" on public.scheduled_deliveries;

create index if not exists scheduled_deliveries_user_slot_idx
  on public.scheduled_deliveries (user_id, slot_at);
