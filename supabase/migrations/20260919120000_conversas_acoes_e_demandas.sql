ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz;

CREATE INDEX IF NOT EXISTS idx_conversations_snoozed ON public.conversations (snoozed_until);
CREATE INDEX IF NOT EXISTS idx_conversations_assignee ON public.conversations (assignee);

CREATE TABLE public.demandas (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  title text not null,
  status text not null default 'aberta' check (status in ('aberta','resolvida','cancelada')),
  resolution text,
  owner_id uuid,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.demandas to authenticated;
grant all on public.demandas to service_role;
alter table public.demandas enable row level security;
create policy "Equipe gerencia demandas" on public.demandas for all to authenticated using (true) with check (true);
create trigger trg_demandas_updated before update on public.demandas for each row execute function public.set_updated_at();
create index idx_demandas_contact on public.demandas (contact_id, status);

CREATE TABLE public.demanda_conversas (
  id uuid primary key default gen_random_uuid(),
  demanda_id uuid not null references public.demandas(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (demanda_id, conversation_id)
);
grant select, insert, update, delete on public.demanda_conversas to authenticated;
grant all on public.demanda_conversas to service_role;
alter table public.demanda_conversas enable row level security;
create policy "Equipe gerencia demanda_conversas" on public.demanda_conversas for all to authenticated using (true) with check (true);
create index idx_demanda_conversas_conversation on public.demanda_conversas (conversation_id);
