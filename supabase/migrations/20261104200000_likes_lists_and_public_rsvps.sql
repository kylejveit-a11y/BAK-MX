-- Community: comment likes, and RSVPs a rider can keep off the public going list.
-- Likes stay readable by signed-in riders (who liked a post or comment is shown, like on any social app).
-- An RSVP is public only when the rider says so; private RSVPs still count toward the totals, which come from
-- a definer function that returns numbers only, never who.

create table public.comment_likes(
 comment_id uuid not null references public.post_comments on delete cascade,
 user_id uuid not null references auth.users on delete cascade,
 created_at timestamptz not null default now(),primary key(comment_id,user_id));
create index comment_likes_owner on public.comment_likes(user_id);
alter table public.comment_likes enable row level security;
grant select,insert,delete on public.comment_likes to authenticated;
create policy comment_likes_read on public.comment_likes for select to authenticated using(true);
create policy comment_likes_insert on public.comment_likes for insert to authenticated with check((select auth.uid())=user_id
 and exists(select 1 from public.post_comments c join public.posts o on o.id=c.post_id where c.id=comment_id and c.removed_at is null and o.removed_at is null
  and not private.blocked_with(c.user_id) and not private.blocked_with(o.user_id)));
create policy comment_likes_delete on public.comment_likes for delete to authenticated using((select auth.uid())=user_id);

alter table public.event_rsvps add column public boolean not null default false;
grant update(status,public) on public.event_rsvps to authenticated;
alter policy rsvps_read on public.event_rsvps using(public or (select auth.uid())=user_id);

create or replace function public.event_rsvp_counts(p_event_ids uuid[])
returns table(event_id uuid,going bigint,interested bigint)
language sql stable security definer set search_path to '' as $f$
 select r.event_id,count(*) filter (where r.status='going'),count(*) filter (where r.status='interested')
 from public.event_rsvps r join public.events e on e.id=r.event_id and e.removed_at is null
 where r.event_id=any(p_event_ids) and (select auth.uid()) is not null group by r.event_id $f$;
revoke all on function public.event_rsvp_counts(uuid[]) from public,anon;
grant execute on function public.event_rsvp_counts(uuid[]) to authenticated;
