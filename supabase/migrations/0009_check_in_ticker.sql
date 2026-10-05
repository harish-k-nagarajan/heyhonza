-- Minute ticker for /api/cron/check-ins. Two Vault secrets are required:
-- honza_cron_secret (same value as the server CRON_SECRET) and
-- honza_check_ins_url (the full /api/cron/check-ins URL on your deployment).
-- The job no-ops until both exist. Vercel Hobby can only cron once a day,
-- which misses a chosen clock time until the next morning.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create or replace function private.tick_honza_check_ins()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret text;
  target text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'honza_cron_secret'
  limit 1;

  select decrypted_secret into target
  from vault.decrypted_secrets
  where name = 'honza_check_ins_url'
  limit 1;

  if secret is null or length(btrim(secret)) = 0 then
    raise warning 'honza_cron_secret is not set';
    return;
  end if;

  if target is null or length(btrim(target)) = 0 then
    raise warning 'honza_check_ins_url is not set';
    return;
  end if;

  perform net.http_post(
    url := btrim(target),
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || secret
    ),
    timeout_milliseconds := 55000
  );
end;
$$;

revoke all on function private.tick_honza_check_ins() from public;
revoke all on function private.tick_honza_check_ins() from anon, authenticated;
grant execute on function private.tick_honza_check_ins() to postgres;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'honza-check-ins') then
    perform cron.unschedule('honza-check-ins');
  end if;
end $$;

select cron.schedule(
  'honza-check-ins',
  '* * * * *',
  $$select private.tick_honza_check_ins()$$
);
