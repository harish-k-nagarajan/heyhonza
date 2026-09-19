-- Live notes + topic rotation for the conversation engine.
-- Apply after 0005. Safe if columns already exist.

alter table public.profiles
  add column if not exists focus_topic text;
alter table public.profiles
  add column if not exists recent_topics text[] not null default '{}';
alter table public.profiles
  add column if not exists last_openers text[] not null default '{}';

-- Refreshing a public Google Doc updates the existing row.
drop policy if exists "user_context_update_own" on public.user_context;
create policy "user_context_update_own"
  on public.user_context for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
