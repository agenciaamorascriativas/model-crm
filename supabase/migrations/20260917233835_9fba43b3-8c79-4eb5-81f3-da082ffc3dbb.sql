-- Tipos e funções base
create type public.app_role as enum ('admin', 'member');

-- Equipe
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Equipe pode ver cargos" on public.user_roles for select to authenticated using (true);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Equipe pode ver perfis" on public.profiles for select to authenticated using (true);
create policy "Usuario cria o proprio perfil" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "Usuario edita o proprio perfil" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  company text,
  notes text,
  tags text[] not null default '{}',
  owner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.contacts to authenticated;
grant all on public.contacts to service_role;
alter table public.contacts enable row level security;
create policy "Equipe gerencia contatos" on public.contacts for all to authenticated using (true) with check (true);
create trigger trg_contacts_updated before update on public.contacts for each row execute function public.set_updated_at();

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  status text not null default 'aberta',
  assignee uuid,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;
create policy "Equipe gerencia conversas" on public.conversations for all to authenticated using (true) with check (true);
create trigger trg_conversations_updated before update on public.conversations for each row execute function public.set_updated_at();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction text not null default 'entrada' check (direction in ('entrada','saida')),
  body text,
  media_url text,
  author_id uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "Equipe gerencia mensagens" on public.messages for all to authenticated using (true) with check (true);
create index idx_messages_conversation on public.messages (conversation_id, created_at);

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pipelines to authenticated;
grant all on public.pipelines to service_role;
alter table public.pipelines enable row level security;
create policy "Equipe gerencia funis" on public.pipelines for all to authenticated using (true) with check (true);

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pipeline_stages to authenticated;
grant all on public.pipeline_stages to service_role;
alter table public.pipeline_stages enable row level security;
create policy "Equipe gerencia estagios" on public.pipeline_stages for all to authenticated using (true) with check (true);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  contact_id uuid references public.contacts(id) on delete set null,
  pipeline_id uuid references public.pipelines(id) on delete set null,
  stage_id uuid references public.pipeline_stages(id) on delete set null,
  value_cents bigint not null default 0,
  status text not null default 'aberto' check (status in ('aberto','ganho','perdido')),
  position int not null default 0,
  owner_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "Equipe gerencia negocios" on public.leads for all to authenticated using (true) with check (true);
create trigger trg_leads_updated before update on public.leads for each row execute function public.set_updated_at();

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind text not null default 'nota' check (kind in ('nota','movimento','sistema')),
  content text,
  author_id uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.lead_events to authenticated;
grant all on public.lead_events to service_role;
alter table public.lead_events enable row level security;
create policy "Equipe gerencia historico" on public.lead_events for all to authenticated using (true) with check (true);
create index idx_lead_events_lead on public.lead_events (lead_id, created_at);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  contact_id uuid references public.contacts(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  owner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.appointments to authenticated;
grant all on public.appointments to service_role;
alter table public.appointments enable row level security;
create policy "Equipe gerencia compromissos" on public.appointments for all to authenticated using (true) with check (true);
create trigger trg_appointments_updated before update on public.appointments for each row execute function public.set_updated_at();

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date,
  assignee uuid,
  done boolean not null default false,
  contact_id uuid references public.contacts(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "Equipe gerencia tarefas" on public.tasks for all to authenticated using (true) with check (true);
create trigger trg_tasks_updated before update on public.tasks for each row execute function public.set_updated_at();

create table public.app_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Amoras CRM',
  logo_url text,
  whatsapp_number text,
  updated_at timestamptz not null default now()
);
grant select, update on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "Equipe ve configuracoes" on public.app_settings for select to authenticated using (true);
create policy "Admin edita configuracoes" on public.app_settings for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
insert into public.app_settings (id) values (1) on conflict do nothing;

insert into public.pipelines (name, position) values ('Funil de Vendas', 0);
insert into public.pipeline_stages (pipeline_id, name, position, color)
select p.id, s.name, s.pos, s.color from public.pipelines p,
(VALUES
  ('Novo contato', 0, '#94a3b8'),
  ('Qualificação', 1, '#6366f1'),
  ('Proposta enviada', 2, '#f59e0b'),
  ('Negociação', 3, '#ec4899'),
  ('Fechamento', 4, '#10b981')
) as s(name, pos, color)
where p.name = 'Funil de Vendas';

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;