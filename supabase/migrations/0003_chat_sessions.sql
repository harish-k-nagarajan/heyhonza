-- Honza — chat sessions: typed chats can be started, ended, and browsed in history.
-- Call turns may optionally share a session_id but are not listed as separate entries.

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  preview text not null default '',
  message_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists chat_sessions_user_started_idx
  on public.chat_sessions (user_id, started_at desc);

alter table public.messages
  add column if not exists session_id uuid references public.chat_sessions (id) on delete cascade;

create index if not exists messages_session_created_idx
  on public.messages (session_id, created_at);

alter table public.chat_sessions enable row level security;

drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

drop policy if exists "chat_sessions_delete_own" on public.chat_sessions;
create policy "chat_sessions_delete_own"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);
