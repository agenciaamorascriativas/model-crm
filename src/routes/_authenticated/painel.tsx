import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { PageHeader, PageContainer, StatCard, Panel, formatBRL } from "@/components/page-shell";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Handshake,
  ListChecks,
  CalendarClock,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  painelIndicadoresHoje,
  conversasPorDia,
  funilResumo,
  proximosCompromissos,
  tarefasAtrasadas,
  atividadeRecenteEquipe,
} from "@/lib/demo/relatorios";

export const Route = createFileRoute("/_authenticated/painel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel — Amoras CRM" },
      { name: "description", content: "Visão geral do dia: conversas, negócios, tarefas e compromissos." },
      { property: "og:title", content: "Painel — Amoras CRM" },
      { property: "og:description", content: "Visão geral do dia: conversas, negócios, tarefas e compromissos." },
    ],
  }),
  component: PainelPage,
});

const chartConfig = {
  conversas: { label: "Conversas", color: "var(--chart-1)" },
} satisfies ChartConfig;

function PainelPage() {
  const totalFunil = funilResumo.reduce((s, e) => s + e.quantidade, 0);

  return (
    <PageContainer wide>
      <PageHeader
        title="Olá, bem-vinda de volta! 👋"
        description="Aqui está o resumo do que está acontecendo hoje."
        demo
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Conversas abertas" value={painelIndicadoresHoje.conversasAbertas} icon={MessageCircle} />
        <StatCard
          label="Negócios em aberto"
          value={painelIndicadoresHoje.negociosAbertos}
          hint={formatBRL(painelIndicadoresHoje.negociosValorCents)}
          icon={Handshake}
        />
        <StatCard label="Tarefas de hoje" value={painelIndicadoresHoje.tarefasHoje} icon={ListChecks} />
        <StatCard label="Compromissos" value={painelIndicadoresHoje.compromissosHoje} icon={CalendarClock} />
        <StatCard label="Tarefas atrasadas" value={tarefasAtrasadas.length} hint="Precisam de atenção" icon={AlertTriangle} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Conversas por dia" description="Últimos 7 dias" className="xl:col-span-2">
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <BarChart data={conversasPorDia}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="conversas" fill="var(--color-conversas)" radius={6} />
            </BarChart>
          </ChartContainer>
        </Panel>

        <Panel title="Funil resumido" description="Negócios por estágio">
          <div className="space-y-3">
            {funilResumo.map((e) => (
              <div key={e.estagio}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{e.estagio}</span>
                  <span className="text-muted-foreground">{e.quantidade}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(e.quantidade / totalFunil) * 100}%`,
                      backgroundColor: e.cor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Próximos compromissos">
          <ul className="space-y-3">
            {proximosCompromissos.map((c) => (
              <li key={c.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-8 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                  {c.horario}
                </span>
                <div>
                  <p className="font-medium leading-snug">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground">{c.pessoa}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Tarefas atrasadas">
          <ul className="space-y-3">
            {tarefasAtrasadas.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium leading-snug">{t.titulo}</p>
                  <p className="text-xs text-muted-foreground">{t.responsavel}</p>
                </div>
                <Badge variant="destructive" className="shrink-0 gap-1">
                  <Clock className="h-3 w-3" /> {t.diasAtraso}d
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Atividade recente da equipe">
          <ul className="space-y-3">
            {atividadeRecenteEquipe.map((a) => (
              <li key={a.id} className="text-sm">
                <p className="leading-snug">
                  <span className="font-medium">{a.pessoa}</span> {a.acao}
                </p>
                <p className="text-xs text-muted-foreground">{a.horario}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageContainer>
  );
}
