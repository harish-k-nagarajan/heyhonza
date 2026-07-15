-- Honza — Phase 4/5/6: per-user conversation history, context, and settings.
--
-- Everything hangs off auth.users (BUILD_SPEC §3: every primitive hangs data
-- off the user id). Row Level Security is own-row-only, exactly like profiles,
-- so a second user has a fully separate, empty history with no data bleed
-- (the Phase 4 verification gate).
--
-- Apply with the Supabase SQL editor or `supabase db push`, after 0001.

-- ---------------------------------------------------------------------------
-- Settings that must survive re-login live on the profile (one data model
-- shared by onboarding + Settings — Phase 6 gate). onboarding_completed and
-- created_at already exist from 0001; add the rest idempotently.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists level text not null default 'A2';
alter table public.profiles add column if not exists topics text[] not null default '{}';
alter table public.profiles add column if not exists preferred_model text;

-- ---------------------------------------------------------------------------
-- Chat + call turns. `kind` tags whether a turn came from the text chat or a
-- voice call (Phase 8), so both share one continuous record (BUILD_SPEC §4/§8).
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  kind text not null default 'chat' check (kind in ('chat', 'call')),
  created_at timestamptz not null default now()
);

create index if not exists messages_user_created_idx
  on public.messages (user_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = user_id);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own"
  on public.messages for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Ingested learner context (Google Doc / file / pasted). One row per chunk,
-- each stamped with when it was ingested so Settings can show "last synced"
-- (Phase 5 gate). The conversation engine reads context from here, not the
-- client. `source_ref` holds the doc URL / file name / paste label.
-- ---------------------------------------------------------------------------
create table if not exists public.user_context (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_kind text not null check (source_kind in ('google_doc', 'file', 'pasted')),
  source_ref text,
  content text not null,
  synced_at timestamptz not null default now()
);

create index if not exists user_context_user_synced_idx
  on public.user_context (user_id, synced_at);

alter table public.user_context enable row level security;

drop policy if exists "user_context_select_own" on public.user_context;
create policy "user_context_select_own"
  on public.user_context for select
  using (auth.uid() = user_id);

drop policy if exists "user_context_insert_own" on public.user_context;
create policy "user_context_insert_own"
  on public.user_context for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_context_delete_own" on public.user_context;
create policy "user_context_delete_own"
  on public.user_context for delete
  using (auth.uid() = user_id);
