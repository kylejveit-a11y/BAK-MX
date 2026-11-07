-- Notifications: phone push (Expo) and the in-app list on the web, from the same records.
--  * push_devices: one row per phone install (its Expo push token). A token Expo reports as no longer registered is
--    marked inactive, never deleted here; signing out marks it inactive too.
--  * notification_preferences: the rider's on/off per kind and their time zone. A missing row or a null means the
--    default: on, except service_due, where null means "on when the rider has set a Remind me hour on a service".
--  * notifications: what was sent (or listed) to whom. dedupe_key is unique per rider, so the same reminder, message or
--    comment never notifies twice; subject groups a service item so it notifies at most once a week.
-- Riders read and change only their own rows. Notifications are written by the server (service role) only.
-- Non-destructive: creates only, guarded so it can be re-run. No data is changed or removed.

create table if not exists public.push_devices(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 token text not null check (char_length(token) between 10 and 200),
 platform text not null default 'ios' check (platform in ('ios','android')),
 time_zone text check (time_zone is null or char_length(time_zone)<=64),
 app_version text check (app_version is null or char_length(app_version)<=40),
 active boolean not null default true,
 last_error text check (last_error is null or char_length(last_error)<=200),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists push_devices_token on public.push_devices(token);
create index if not exists push_devices_user_active on public.push_devices(user_id) where active;

create table if not exists public.notification_preferences(
 user_id uuid primary key references auth.users(id) on delete cascade,
 messages boolean,
 replies boolean,
 events boolean,
 service_due boolean,
 time_zone text check (time_zone is null or char_length(time_zone)<=64),
 updated_at timestamptz not null default now()
);

create table if not exists public.notifications(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('service_due','event_reminder','message','reply')),
 title text not null check (char_length(title) between 1 and 200),
 body text not null default '' check (char_length(body)<=400),
 link text not null default '' check (char_length(link)<=400),
 data jsonb not null default '{}'::jsonb,
 dedupe_key text not null check (char_length(dedupe_key) between 1 and 200),
 subject text check (subject is null or char_length(subject)<=200),
 push_status text not null default 'pending' check (push_status in ('pending','sent','no_device','failed')),
 push_tickets jsonb not null default '[]'::jsonb,
 pushed_at timestamptz,
 receipts_checked_at timestamptz,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create unique index if not exists notifications_dedupe on public.notifications(user_id,dedupe_key);
create index if not exists notifications_user_recent on public.notifications(user_id,created_at desc);
create index if not exists notifications_subject on public.notifications(user_id,subject,created_at desc) where subject is not null;
create index if not exists notifications_push_pending on public.notifications(created_at) where push_status='pending';
create index if not exists notifications_receipts_due on public.notifications(pushed_at) where push_status='sent' and receipts_checked_at is null;

alter table public.push_devices enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;

revoke all on public.push_devices from anon,authenticated;
revoke all on public.notification_preferences from anon,authenticated;
revoke all on public.notifications from anon,authenticated;
grant select,insert on public.push_devices to authenticated;
grant update(platform,time_zone,app_version,active,updated_at) on public.push_devices to authenticated;
grant select,insert,update on public.notification_preferences to authenticated;
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant all on public.push_devices,public.notification_preferences,public.notifications to service_role;

do $$ begin
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='push_devices' and policyname='push_devices_own') then
  create policy push_devices_own on public.push_devices for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='notification_preferences' and policyname='notification_preferences_own') then
  create policy notification_preferences_own on public.notification_preferences for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_read_own') then
  create policy notifications_read_own on public.notifications for select to authenticated using(user_id=(select auth.uid()));
 end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_mark_read_own') then
  create policy notifications_mark_read_own on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
 end if;
end $$;
