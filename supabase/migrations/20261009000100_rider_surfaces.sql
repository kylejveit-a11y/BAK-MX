-- BAK MX rider surfaces: profile, community, events, messages, moderation, feedback,
-- setup log and parts catalog. Additive only. Rider tables are RLS-governed; the API uses the rider's own token.

create table public.profiles(
 user_id uuid primary key references auth.users on delete cascade,
 handle text not null check(handle ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null default '' check(length(display_name)<=60),
 bio text not null default '' check(length(bio)<=500),
 location text not null default '' check(length(location)<=80),
 riding_class text not null default '' check(length(riding_class)<=60),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create unique index profiles_handle on public.profiles(handle);

create table public.user_blocks(
 blocker_id uuid not null references auth.users on delete cascade,
 blocked_id uuid not null references auth.users on delete cascade,
 created_at timestamptz not null default now(),
 primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id));
create index user_blocks_blocked on public.user_blocks(blocked_id);

-- True when the calling rider and the other rider have a block in either direction.
-- Definer rights are limited to this yes/no answer about the caller's own relationships.
create function public.blocked_with(p_other uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_blocks b
  where (b.blocker_id=(select auth.uid()) and b.blocked_id=p_other) or (b.blocker_id=p_other and b.blocked_id=(select auth.uid())));
$$;
revoke all on function public.blocked_with(uuid) from public,anon;
grant execute on function public.blocked_with(uuid) to authenticated,service_role;

create table public.posts(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,
 category text not null check(category in ('build','setup_question','ride_plan','general')),
 body text not null check(length(trim(body)) between 1 and 4000),
 bike_label text not null default '' check(length(bike_label)<=120),
 created_at timestamptz not null default now(),removed_at timestamptz);
create index posts_recent on public.posts(created_at desc);
create index posts_owner on public.posts(user_id);

create table public.post_comments(
 id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 body text not null check(length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now(),removed_at timestamptz);
create index post_comments_post on public.post_comments(post_id,created_at);
create index post_comments_owner on public.post_comments(user_id);

create table public.post_likes(
 post_id uuid not null references public.posts on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 created_at timestamptz not null default now(),primary key(post_id,user_id));
create index post_likes_owner on public.post_likes(user_id);

create table public.events(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,
 title text not null check(length(trim(title)) between 1 and 120),
 event_type text not null check(event_type in ('ride_day','race','practice','clinic','meetup')),
 starts_at timestamptz not null,ends_at timestamptz check(ends_at is null or ends_at>=starts_at),
 location_name text not null check(length(trim(location_name)) between 1 and 160),
 description text not null default '' check(length(description)<=4000),
 created_at timestamptz not null default now(),canceled_at timestamptz,removed_at timestamptz);
create index events_upcoming on public.events(starts_at);
create index events_owner on public.events(user_id);

create table public.event_rsvps(
 event_id uuid not null references public.events on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 status text not null check(status in ('going','interested')),
 created_at timestamptz not null default now(),primary key(event_id,user_id));
create index event_rsvps_owner on public.event_rsvps(user_id);

create table public.direct_messages(
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references auth.users on delete cascade,
 recipient_id uuid not null references auth.users on delete cascade,
 body text not null check(length(trim(body)) between 1 and 4000),
 created_at timestamptz not null default now(),read_at timestamptz,check(sender_id<>recipient_id));
create index direct_messages_sender on public.direct_messages(sender_id,created_at desc);
create index direct_messages_recipient on public.direct_messages(recipient_id,created_at desc);

create table public.content_reports(
 id uuid primary key default gen_random_uuid(),reporter_id uuid not null references auth.users on delete cascade,
 target_type text not null check(target_type in ('post','comment','event','message','profile')),
 target_id uuid not null,reason text not null check(length(trim(reason)) between 1 and 1000),
 created_at timestamptz not null default now(),resolved_at timestamptz,resolution text);
create index content_reports_open on public.content_reports(created_at) where resolved_at is null;
create index content_reports_owner on public.content_reports(reporter_id);

create table public.feedback(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,
 category text not null check(category in ('bug','answer_quality','missing_data','idea','other')),
 body text not null check(length(trim(body)) between 1 and 4000),
 context jsonb not null default '{}',created_at timestamptz not null default now());
create index feedback_owner on public.feedback(user_id);

create table public.setup_logs(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,bike_id uuid not null,
 recorded_at timestamptz not null,track text not null default '' check(length(track)<=120),
 conditions text not null default '' check(length(conditions)<=200),
 engine_hours numeric check(engine_hours>=0),
 settings jsonb not null default '{}',
 change_made text not null default '' check(length(change_made)<=1000),
 result text not null default 'not_tested' check(result in ('better','worse','no_change','not_tested')),
 notes text not null default '' check(length(notes)<=4000),
 created_at timestamptz not null default now(),
 foreign key(bike_id,user_id) references public.bikes(id,user_id) on delete cascade);
create index setup_logs_owner on public.setup_logs(user_id,bike_id,recorded_at desc);

-- Parts catalog: reference data written only by the service role from reconciled captures.
create table public.part_catalogs(
 id uuid primary key default gen_random_uuid(),
 manufacturer text not null,model text not null,model_year integer not null,variant text not null,region text not null,
 source text not null,source_url text not null default '',scope_label text not null default '',capture_sha256 text not null default '',
 complete boolean not null default false,assembly_count integer not null default 0,part_count integer not null default 0,
 created_at timestamptz not null default now(),
 unique(manufacturer,model,model_year,variant,region,source));
create table public.part_assemblies(
 id uuid primary key default gen_random_uuid(),catalog_id uuid not null references public.part_catalogs on delete cascade,
 external_id text not null,name text not null,diagram_url text not null default '',source_url text not null default '',
 position integer not null default 0,unique(catalog_id,external_id));
create table public.parts(
 id bigint generated always as identity primary key,assembly_id uuid not null references public.part_assemblies on delete cascade,
 position integer not null default 0,callout text not null default '',part_number text,description text not null default '',
 quantity_raw text not null default '',remarks text not null default '');
create index parts_assembly on public.parts(assembly_id,position);
create index parts_number on public.parts(part_number);

do $$ declare t text; begin
 foreach t in array array['profiles','user_blocks','posts','post_comments','post_likes','events','event_rsvps','direct_messages','content_reports','feedback','setup_logs','part_catalogs','part_assemblies','parts'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant usage,select on all sequences in schema public to service_role;

-- Profiles
grant select,insert on public.profiles to authenticated;
grant update(handle,display_name,bio,location,riding_class,updated_at) on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated using((select auth.uid())=user_id or not public.blocked_with(user_id));
create policy profiles_insert on public.profiles for insert to authenticated with check((select auth.uid())=user_id);
create policy profiles_update on public.profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

-- Blocks
grant select,insert,delete on public.user_blocks to authenticated;
create policy blocks_read on public.user_blocks for select to authenticated using((select auth.uid())=blocker_id);
create policy blocks_insert on public.user_blocks for insert to authenticated with check((select auth.uid())=blocker_id);
create policy blocks_delete on public.user_blocks for delete to authenticated using((select auth.uid())=blocker_id);

-- Posts, comments, likes. A rider must have a profile before publishing.
grant select,insert,delete on public.posts,public.post_comments,public.post_likes to authenticated;
grant update(body,category,bike_label) on public.posts to authenticated;
create policy posts_read on public.posts for select to authenticated using((select auth.uid())=user_id or (removed_at is null and not public.blocked_with(user_id)));
create policy posts_insert on public.posts for insert to authenticated with check((select auth.uid())=user_id and removed_at is null and exists(select 1 from public.profiles p where p.user_id=(select auth.uid())));
create policy posts_update on public.posts for update to authenticated using((select auth.uid())=user_id and removed_at is null) with check((select auth.uid())=user_id);
create policy posts_delete on public.posts for delete to authenticated using((select auth.uid())=user_id);
create policy comments_read on public.post_comments for select to authenticated using((select auth.uid())=user_id or (removed_at is null and not public.blocked_with(user_id)));
create policy comments_insert on public.post_comments for insert to authenticated with check((select auth.uid())=user_id and removed_at is null
 and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()))
 and exists(select 1 from public.posts o where o.id=post_id and o.removed_at is null and not public.blocked_with(o.user_id)));
create policy comments_delete on public.post_comments for delete to authenticated using((select auth.uid())=user_id);
create policy likes_read on public.post_likes for select to authenticated using(true);
create policy likes_insert on public.post_likes for insert to authenticated with check((select auth.uid())=user_id
 and exists(select 1 from public.posts o where o.id=post_id and o.removed_at is null and not public.blocked_with(o.user_id)));
create policy likes_delete on public.post_likes for delete to authenticated using((select auth.uid())=user_id);

-- Events and RSVPs
grant select,insert,delete on public.events,public.event_rsvps to authenticated;
grant update(title,event_type,starts_at,ends_at,location_name,description,canceled_at) on public.events to authenticated;
grant update(status) on public.event_rsvps to authenticated;
create policy events_read on public.events for select to authenticated using((select auth.uid())=user_id or (removed_at is null and not public.blocked_with(user_id)));
create policy events_insert on public.events for insert to authenticated with check((select auth.uid())=user_id and removed_at is null and exists(select 1 from public.profiles p where p.user_id=(select auth.uid())));
create policy events_update on public.events for update to authenticated using((select auth.uid())=user_id and removed_at is null) with check((select auth.uid())=user_id);
create policy events_delete on public.events for delete to authenticated using((select auth.uid())=user_id);
create policy rsvps_read on public.event_rsvps for select to authenticated using(true);
create policy rsvps_insert on public.event_rsvps for insert to authenticated with check((select auth.uid())=user_id
 and exists(select 1 from public.events e where e.id=event_id and e.removed_at is null and e.canceled_at is null and not public.blocked_with(e.user_id)));
create policy rsvps_update on public.event_rsvps for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy rsvps_delete on public.event_rsvps for delete to authenticated using((select auth.uid())=user_id);

-- Direct messages: only the two riders involved; never across a block.
grant select,insert on public.direct_messages to authenticated;
grant update(read_at) on public.direct_messages to authenticated;
create policy dm_read on public.direct_messages for select to authenticated using((select auth.uid()) in (sender_id,recipient_id));
create policy dm_insert on public.direct_messages for insert to authenticated with check((select auth.uid())=sender_id and read_at is null
 and not public.blocked_with(recipient_id)
 and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()))
 and exists(select 1 from public.profiles p where p.user_id=recipient_id));
create policy dm_mark_read on public.direct_messages for update to authenticated using((select auth.uid())=recipient_id) with check((select auth.uid())=recipient_id);

-- Reports and feedback: riders write and see their own; review happens with the service role.
grant select,insert on public.content_reports,public.feedback to authenticated;
create policy reports_read on public.content_reports for select to authenticated using((select auth.uid())=reporter_id);
create policy reports_insert on public.content_reports for insert to authenticated with check((select auth.uid())=reporter_id and resolved_at is null and resolution is null);
create policy feedback_read on public.feedback for select to authenticated using((select auth.uid())=user_id);
create policy feedback_insert on public.feedback for insert to authenticated with check((select auth.uid())=user_id);

-- Setup log: owner only.
grant select,insert,delete on public.setup_logs to authenticated;
grant update(recorded_at,track,conditions,engine_hours,settings,change_made,result,notes) on public.setup_logs to authenticated;
create policy setup_read on public.setup_logs for select to authenticated using((select auth.uid())=user_id);
create policy setup_insert on public.setup_logs for insert to authenticated with check((select auth.uid())=user_id);
create policy setup_update on public.setup_logs for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy setup_delete on public.setup_logs for delete to authenticated using((select auth.uid())=user_id);

-- Parts catalog: signed-in riders read; nobody but the service role writes.
grant select on public.part_catalogs,public.part_assemblies,public.parts to authenticated;
create policy catalogs_read on public.part_catalogs for select to authenticated using(true);
create policy assemblies_read on public.part_assemblies for select to authenticated using(true);
create policy parts_read on public.parts for select to authenticated using(true);
