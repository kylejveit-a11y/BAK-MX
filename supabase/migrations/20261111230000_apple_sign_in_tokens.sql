-- Sign in with Apple: the refresh token Apple's revoke endpoint needs when a rider deletes their account.
-- Service role only: no policies, so riders never read or write it from the app.
create table if not exists public.apple_sign_in_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  refresh_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.apple_sign_in_tokens enable row level security;
revoke all on public.apple_sign_in_tokens from anon, authenticated;
