-- Tuning notes (shared/tuning-notes.ts): a BAK answer the rider saved to a bike (the question, the answer, the setup
-- changes with stock values, the bike and the day) or a note the rider wrote. Saved to the account, so notes are on every
-- device instead of one phone or browser.
--
-- Additive and re-runnable: a new table, indexes, grants and policies, each only when missing. Nothing is dropped,
-- deleted or rewritten. Riders never hard-delete a note: "Delete" sets removed_at (there is no DELETE grant).
--
-- Who sees what: a rider reads and writes only their own rows, on their own bikes. Notes are never shared by the server;
-- the share sheet is made on the rider's device from their own note.

create table if not exists public.tuning_notes(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users on delete cascade,
 bike_id uuid not null,
 conversation_id uuid references public.conversations(id) on delete set null,
 source_message_id uuid references public.messages(id) on delete set null,
 title text not null,
 question text not null default '',
 answer text not null default '',
 setup_changes jsonb not null default '[]'::jsonb,
 rider_note text not null default '',
 bike_label text not null default '',
 noted_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 removed_at timestamptz,
 foreign key(bike_id,user_id) references public.bikes(id,user_id) on delete cascade
);

do $$ begin
 if not exists(select 1 from pg_constraint where conname='tuning_notes_fields_bounded' and conrelid='public.tuning_notes'::regclass) then
  alter table public.tuning_notes add constraint tuning_notes_fields_bounded check (
   char_length(btrim(title)) between 1 and 120 and char_length(question)<=8000 and char_length(answer)<=20000
   and char_length(rider_note)<=4000 and char_length(bike_label)<=160
   and (char_length(btrim(answer))>0 or char_length(btrim(rider_note))>0));
 end if;
 if not exists(select 1 from pg_constraint where conname='tuning_notes_changes_shape' and conrelid='public.tuning_notes'::regclass) then
  alter table public.tuning_notes add constraint tuning_notes_changes_shape check (
   jsonb_typeof(setup_changes)='array' and jsonb_array_length(setup_changes)<=6 and pg_column_size(setup_changes)<=8000);
 end if;
end $$;

create index if not exists tuning_notes_owner_bike on public.tuning_notes(user_id,bike_id,noted_at desc) where removed_at is null;
-- One live note per BAK answer: saving the same answer again returns the note already saved.
create unique index if not exists tuning_notes_one_per_answer on public.tuning_notes(user_id,source_message_id) where source_message_id is not null and removed_at is null;

alter table public.tuning_notes enable row level security;
revoke all on public.tuning_notes from anon;
revoke all on public.tuning_notes from authenticated;
grant select on public.tuning_notes to authenticated;
grant insert(id,user_id,bike_id,conversation_id,source_message_id,title,question,answer,setup_changes,rider_note,bike_label,noted_at) on public.tuning_notes to authenticated;
-- Rename, edit the rider's own words, and remove. The saved answer, question and changes are not rewritten.
grant update(title,rider_note,updated_at,removed_at) on public.tuning_notes to authenticated;

do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='tuning_notes' and policyname='tuning_notes_read_own') then
  create policy tuning_notes_read_own on public.tuning_notes for select to authenticated using ((select auth.uid())=user_id);
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='tuning_notes' and policyname='tuning_notes_insert_own') then
  create policy tuning_notes_insert_own on public.tuning_notes for insert to authenticated with check (
   (select auth.uid())=user_id and removed_at is null
   and (conversation_id is null or exists(select 1 from public.conversations c where c.id=conversation_id and c.user_id=(select auth.uid())))
   and (source_message_id is null or exists(select 1 from public.messages m where m.id=source_message_id and m.user_id=(select auth.uid()) and m.role='assistant')));
 end if;
 -- A removed note stays removed: only live notes can be changed.
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='tuning_notes' and policyname='tuning_notes_update_own') then
  create policy tuning_notes_update_own on public.tuning_notes for update to authenticated using ((select auth.uid())=user_id and removed_at is null) with check ((select auth.uid())=user_id);
 end if;
end $$;
