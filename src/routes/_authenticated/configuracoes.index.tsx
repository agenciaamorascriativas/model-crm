import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-shell";
import {
  Building2, CalendarDays, KeyRound, Palette, Bell, ShieldCheck,
  UserRound, Users, UserRoundCog, type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Configurações — Amoras CRM" },
      { name: "description", content: "Sua conta, os dados da empresa e quem tem acesso ao quê." },
      { property: "og:title", content: "Configurações — Amoras CRM" },
      { property: "og:description", content: "Sua conta, os dados da empresa e quem tem acesso ao quê." },
    ],
  }),
  component: ConfiguracoesOverview,
});

type Item = { title: string; description: string; to: NonNullable<LinkProps["to"]>; icon: LucideIcon };

const groups: { label: string; items: Item[] }[] = [
  { label: "Sua empresa", items: [
    { title: "Tipos de agendamento", description: "O que se pode marcar, duração, local e responsável.", to: "/configuracoes/agenda", icon: CalendarDays },
    { title: "Equipe", description: "Quem trabalha aqui, papéis e acesso de cada pessoa.", to: "/equipe", icon: Users },
    { title: "Distribuição de atendimento", description: "Quem recebe cada cliente novo e o que cada atendente enxerga.", to: "/configuracoes/distribuicao", icon: UserRoundCog },
    { title: "Organização", description: "Dados gerais da empresa e do atendimento.", to: "/configuracoes/organizacao", icon: Building2 },
    { title: "Atendimento", description: "Horários, mensagens automáticas e regras de espera.", to: "/configuracoes/atendimento", icon: UserRound },
    { title: "Marca", description: "Nome, logo, ícone e cores exibidos no sistema.", to: "/configuracoes/marca", icon: Palette },
  ]},
  { label: "Sua conta", items: [
    { title: "Perfil", description: "Seu nome, idioma, fuso horário e avatar.", to: "/configuracoes/perfil", icon: UserRound },
    { title: "Segurança", description: "Senha, verificação em duas etapas e sessões.", to: "/configuracoes/seguranca", icon: ShieldCheck },
    { title: "Notificações", description: "Por onde e sobre o que você quer ser avisado.", to: "/configuracoes/notificacoes", icon: Bell },
  ]},
  { label: "Dados e acesso", items: [
    { title: "LGPD", description: "Pedidos de exportação e exclusão de dados de clientes.", to: "/privacidade", icon: ShieldCheck },
    { title: "Chaves de API", description: "Chaves para outros sistemas acessarem o CRM.", to: "/configuracoes/api", icon: KeyRound },
  ]},
];

function ConfiguracoesOverview() {
  return <div className="space-y-8">
    <PageHeader title="Configurações" description="Sua conta, os dados da empresa e quem tem acesso ao quê." />
    {groups.map((group) => <section key={group.label} className="space-y-3">
      <h2 className="text-xs font-semibold uppercase text-muted-foreground">{group.label}</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {group.items.map((item) => <Link key={item.title} to={item.to} className="group grid min-h-24 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40">
          <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          <div className="min-w-0"><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p></div>
        </Link>)}
      </div>
    </section>)}
  </div>;
}