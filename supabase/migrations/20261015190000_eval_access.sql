-- Test access to Ask BAK for automated evaluation (approved by Kyle 2026-10-15). Only the server (service role) reads these
-- tables: RLS is on with no policies, so signed-in riders and the public key can never see or use them. Tokens are stored as
-- SHA-256 hashes only; each token expires, can be revoked (set revoked_at) and has a daily cap.
create table if not exists public.eval_access_tokens(
  id uuid primary key default gen_random_uuid(),
  token_sha256 text not null unique,
  label text not null default '',
  daily_limit int not null default 200,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create table if not exists public.eval_runs(
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.eval_access_tokens(id),
  created_at timestamptz not null default now(),
  bike text not null default '',
  message text not null default '',
  prompt_version text not null default '',
  ms int,
  ok boolean not null default false,
  error text
);
create index if not exists eval_runs_token_day on public.eval_runs(token_id,created_at);
alter table public.eval_access_tokens enable row level security;
alter table public.eval_runs enable row level security;
revoke all on public.eval_access_tokens, public.eval_runs from anon, authenticated;
