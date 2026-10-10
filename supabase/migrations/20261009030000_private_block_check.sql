-- The block check must run with definer rights inside policies, but riders have no reason to call it
-- through the API. Move it to a schema the API does not expose and stop exposing the public copy.
create schema if not exists private;
grant usage on schema private to authenticated,service_role;
create or replace function private.blocked_with(p_other uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_blocks b
  where (b.blocker_id=(select auth.uid()) and b.blocked_id=p_other) or (b.blocker_id=p_other and b.blocked_id=(select auth.uid())));
$$;
revoke all on function private.blocked_with(uuid) from public,anon;
grant execute on function private.blocked_with(uuid) to authenticated,service_role;

alter policy profiles_read on public.profiles using((select auth.uid())=user_id or not private.blocked_with(user_id));
alter policy posts_read on public.posts using((select auth.uid())=user_id or (removed_at is null and not private.blocked_with(user_id)));
alter policy comments_read on public.post_comments using((select auth.uid())=user_id or (removed_at is null and not private.blocked_with(user_id)));
alter policy comments_insert on public.post_comments with check((select auth.uid())=user_id and removed_at is null
 and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()))
 and exists(select 1 from public.posts o where o.id=post_id and o.removed_at is null and not private.blocked_with(o.user_id)));
alter policy likes_insert on public.post_likes with check((select auth.uid())=user_id
 and exists(select 1 from public.posts o where o.id=post_id and o.removed_at is null and not private.blocked_with(o.user_id)));
alter policy events_read on public.events using((select auth.uid())=user_id or (removed_at is null and not private.blocked_with(user_id)));
alter policy rsvps_insert on public.event_rsvps with check((select auth.uid())=user_id
 and exists(select 1 from public.events e where e.id=event_id and e.removed_at is null and e.canceled_at is null and not private.blocked_with(e.user_id)));
alter policy dm_insert on public.direct_messages with check((select auth.uid())=sender_id and read_at is null
 and not private.blocked_with(recipient_id)
 and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()))
 and exists(select 1 from public.profiles p where p.user_id=recipient_id));
revoke execute on function public.blocked_with(uuid) from authenticated,anon,public;
