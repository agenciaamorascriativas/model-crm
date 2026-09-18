import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageContainer, StatCard, Panel, formatBRL } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  agentes,
  atendimentosPorDia,
  execucoesRecentes,
  indicadoresGerais,
  PAPEL_LABEL,
} from "@/lib/demo/ia";
import {
  Bot,
  Clock,
  Coins,
  MessageCircleReply,
  Sparkles,
  Wrench,
  Route as RouteIcon,
  BookOpen,
  Brain,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/ia/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Visão geral da IA — Amoras CRM" },
      { name: "description", content: "Indicadores e atividade dos agentes de inteligência artificial." },
      { property: "og:title", content: "Visão geral da IA — Amoras CRM" },
      { property: "og:description", content: "Indicadores e atividade dos agentes de inteligência artificial." },
    ],
  }),
  component: IAIndexPage,
});

const atalhos = [
  { to: "/ia/agentes", label: "Agentes", icon: Bot, description: "Configure quem atende" },
  { to: "/ia/habilidades", label: "Habilidades", icon: Wrench, description: "Ações que a IA executa" },
  { to: "/ia/roteamento", label: "Roteamento", icon: RouteIcon, description: "Regras de encaminhamento" },
  { to: "/ia/conhecimento", label: "Base de conhecimento", icon: BookOpen, description: "O que a IA sabe" },
  { to: "/ia/memoria", label: "Memória", icon: Brain, description: "O que a IA lembra" },
  { to: "/ia/casos", label: "Casos", icon: ShieldAlert, description: "Erros e correções" },
];

function IAIndexPage() {
  const maiorTotal = Math.max(...atendimentosPorDia.map((d) => d.total));

  return (
    <PageContainer wide>
      <PageHeader
        title="Inteligência Artificial"
        description="Acompanhe o desempenho dos agentes de IA e o que eles vêm fazendo pelo seu atendimento."
        demo
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Conversas atendidas pela IA hoje"
          value={indicadoresGerais.conversasHoje}
          hint="Em todos os canais"
          icon={MessageCircleReply}
        />
        <StatCard
          label="Taxa de resolução sem humano"
          value={`${indicadoresGerais.taxaResolucaoSemHumano}%`}
          hint="Conversas encerradas pela IA"
          icon={Sparkles}
        />
        <StatCard
          label="Tempo médio de resposta"
          value={`${indicadoresGerais.tempoMedioRespostaSegundos}s`}
          hint="Do envio à resposta da IA"
          icon={Clock}
        />
        <StatCard
          label="Custo do mês"
          value={formatBRL(indicadoresGerais.custoDoMesCentavos)}
          hint="Uso de modelos de IA"
          icon={Coins}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Atendimentos por dia" description="Últimos 7 dias" className="lg:col-span-2">
          <div className="flex h-48 items-end gap-3">
            {atendimentosPorDia.map((d) => (
              <div key={d.dia} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-primary/80"
                    style={{ height: `${(d.total / maiorTotal) * 100}%` }}
                    title={`${d.total} atendimentos`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.dia}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Agentes ativos" description="Status atual">
          <div className="space-y-3">
            {agentes.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.nome}</p>
                  <p className="text-xs text-muted-foreground">{PAPEL_LABEL[a.papel]}</p>
                </div>
                <Badge variant={a.status === "ativo" ? "default" : "secondary"}>
                  {a.status === "ativo" ? "Ativo" : "Pausado"}
                </Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Últimas execuções" className="lg:col-span-2">
          <div className="space-y-3">
            {execucoesRecentes.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {ex.agente} · {ex.acao}
                  </p>
                  <p className="text-xs text-muted-foreground">{ex.contato} · {ex.data}</p>
                </div>
                <Badge variant={ex.resultado === "sucesso" ? "default" : "destructive"}>
                  {ex.resultado === "sucesso" ? "Sucesso" : "Falha"}
                </Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Atalhos">
          <div className="space-y-2">
            {atalhos.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between gap-2 rounded-xl border p-3 text-sm transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <a.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
