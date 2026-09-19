CREATE TABLE public.calendar_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('google','outlook')),
  account_email text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider)
);
-- Sem grant/policy para authenticated: só o backend (service_role, usado nas
-- funções de servidor) lê ou grava tokens. RLS ligado e sem policy = acesso
-- negado por padrão para qualquer papel que não seja service_role.
grant all on public.calendar_oauth_tokens to service_role;
alter table public.calendar_oauth_tokens enable row level security;
create trigger trg_calendar_oauth_tokens_updated before update on public.calendar_oauth_tokens for each row execute function public.set_updated_at();
