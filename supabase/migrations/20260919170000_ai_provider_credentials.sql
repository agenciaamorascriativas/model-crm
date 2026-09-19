CREATE TABLE public.ai_provider_credentials (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('openai','anthropic','google')),
  api_key text not null,
  key_hint text not null,
  active boolean not null default true,
  models jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider)
);
-- Sem grant/policy para authenticated: só o backend (service_role, usado nas
-- funções de servidor) lê ou grava chaves de IA. RLS ligado e sem policy =
-- acesso negado por padrão pra qualquer papel que não seja service_role.
grant all on public.ai_provider_credentials to service_role;
alter table public.ai_provider_credentials enable row level security;
create trigger trg_ai_provider_credentials_updated before update on public.ai_provider_credentials for each row execute function public.set_updated_at();
