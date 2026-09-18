import {
  MessageCircle,
  Inbox,
  Zap,
  FileText,
  BadgeCheck,
  Users,
  KanbanSquare,
  GitBranch,
  Package,
  ListChecks,
  CalendarDays,
  CheckSquare,
  Bot,
  Sparkles,
  Route as RouteIcon,
  BookOpen,
  Brain,
  Briefcase,
  FileSignature,
  Repeat,
  PlayCircle,
  KeyRound,
  Gauge,
  LineChart,
  BarChart3,
  Radar,
  ScrollText,
  LayoutDashboard,
  UserCog,
  Settings,
  ShieldCheck,
  Megaphone,
  Plug,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import type { LinkProps } from "@tanstack/react-router";

export type NavItem = { to: NonNullable<LinkProps["to"]>; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Início",
    items: [{ to: "/painel", label: "Painel", icon: LayoutDashboard }],
  },
  {
    label: "Conversas",
    items: [
      { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { to: "/chatbot", label: "ChatBot", icon: MessagesSquare },
    ],
  },
  {
    label: "Atendimento",
    items: [
      { to: "/radar", label: "Radar", icon: Radar },
      { to: "/fila", label: "Fila de atendimento", icon: Inbox },
      { to: "/respostas-rapidas", label: "Respostas rápidas", icon: Zap },
      { to: "/modelos", label: "Modelos de mensagem", icon: FileText },
      { to: "/canal-oficial", label: "Canal oficial", icon: BadgeCheck },
    ],
  },
  {
    label: "CRM",
    items: [
      { to: "/contatos", label: "Contatos", icon: Users },
      { to: "/funil", label: "Funil de Vendas", icon: KanbanSquare },
      { to: "/funis", label: "Etapas do Funil", icon: GitBranch },
      { to: "/produtos", label: "Produtos e serviços", icon: Package },
      { to: "/atividades", label: "Atividades", icon: ListChecks },
    ],
  },
  {
    label: "Agenda",
    items: [
      { to: "/agenda", label: "Agenda", icon: CalendarDays },
      { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
    ],
  },
  {
    label: "Inteligência artificial",
    items: [
      { to: "/ia", label: "Visão geral", icon: Sparkles },
      { to: "/ia/agentes", label: "Agentes", icon: Bot },
      { to: "/ia/habilidades", label: "Habilidades", icon: Zap },
      { to: "/ia/roteamento", label: "Roteamento", icon: RouteIcon },
      { to: "/ia/conhecimento", label: "Base de conhecimento", icon: BookOpen },
      { to: "/ia/memoria", label: "Memória", icon: Brain },
      { to: "/ia/casos", label: "Casos", icon: Briefcase },
      { to: "/ia/propostas", label: "Propostas", icon: FileSignature },
      { to: "/ia/followups", label: "Follow-up", icon: Repeat },
      { to: "/ia/execucoes", label: "Execuções", icon: PlayCircle },
      { to: "/ia/conversas", label: "Conversas da IA", icon: MessageCircle },
      { to: "/ia/provedores", label: "Provedores e chaves", icon: KeyRound },
      { to: "/ia/consumo", label: "Consumo", icon: Gauge },
      { to: "/ia/evolucao", label: "Evolução", icon: LineChart },
    ],
  },
  {
    label: "Relatórios",
    items: [
      { to: "/metricas", label: "Métricas", icon: BarChart3 },
      { to: "/analise", label: "Análise", icon: LineChart },
      { to: "/auditoria", label: "Auditoria", icon: ScrollText },
    ],
  },
  {
    label: "Marketing",
    items: [
      { to: "/marketing/conversoes", label: "Conversões", icon: LineChart },
      { to: "/marketing/meta-ads", label: "Meta Ads", icon: Megaphone },
    ],
  },
  {
    label: "Integrações",
    items: [
      { to: "/integracoes", label: "Conexões", icon: Plug },
      { to: "/integracoes/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { to: "/integracoes/webhooks", label: "Webhooks", icon: RouteIcon },
    ],
  },
  {
    label: "Administração",
    items: [
      { to: "/equipe", label: "Equipe", icon: UserCog },
      { to: "/privacidade", label: "Privacidade (LGPD)", icon: ShieldCheck },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];
