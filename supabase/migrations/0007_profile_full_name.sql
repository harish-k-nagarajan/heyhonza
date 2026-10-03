-- Full name shown on the account card. `profiles.name` stays the name Honza uses.
alter table public.profiles
  add column if not exists full_name text;
