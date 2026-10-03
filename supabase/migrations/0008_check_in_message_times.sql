-- One clock time per daily check-in. Null second/third means the scheduler
-- still places those messages 4h and 8h after the first.

alter table public.profiles
  add column if not exists second_message_time text;

alter table public.profiles
  add column if not exists third_message_time text;

alter table public.profiles
  drop constraint if exists profiles_second_message_time_check;
alter table public.profiles
  add constraint profiles_second_message_time_check
  check (second_message_time is null or second_message_time ~ '^\d{2}:\d{2}$');

alter table public.profiles
  drop constraint if exists profiles_third_message_time_check;
alter table public.profiles
  add constraint profiles_third_message_time_check
  check (third_message_time is null or third_message_time ~ '^\d{2}:\d{2}$');
