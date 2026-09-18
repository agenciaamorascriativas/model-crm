import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import { PageHeader, PageContainer, StatCard, Panel, formatBRL } from "@/components/page-shell";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Timer, CheckCircle2, TrendingUp, Trophy, XCircle, Percent, Wallet, Coins } from "lucide-react";
import {
  periodosDisponiveis,
  indicadoresAtendimento,
  conversasPorAtendente,
  indicadoresVendas,
  vendasPorSemana,
  desempenhoPorAtendente,
} from "@/lib/demo/relatorios";

export const Route = createFileRoute("/_authenticated/metricas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Métricas — Amoras CRM" },
      { name: "description", content: "Indicadores de atendimento e vendas por período." },
      { property: "og:title", content: "Métricas — Amoras CRM" },
      { property: "og:description", content: "Indicadores de atendimento e vendas por período." },
    ],
  }),
  component: MetricasPage,
});

const canalConfig = {
  conversas: { label: "Conversas" },
} satisfies ChartConfig;

const vendasConfig = {
  ganhos: { label: "Ganhos", color: "var(--chart-2)" },
  perdidos: { label: "Perdidos", color: "var(--chart-1)" },
} satisfies ChartConfig;

const CORES_CANAL = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function MetricasPage() {
  const [periodo, setPeriodo] = useState("30d");

  return (
    <PageContainer wide>
      <PageHeader
        title="Métricas"
        description="Acompanhe indicadores de atendimento e vendas."
        demo
        actions={
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodosDisponiveis.map((p) => (
                <SelectItem key={p.valor} value={p.valor}>
                  {p.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <h2 className="mb-3 font-display text-lg font-semibold">Atendimento</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Primeira resposta"
          value={`${indicadoresAtendimento.tempoPrimeiraRespostaMin} min`}
          icon={Timer}
        />
        <StatCard
          label="Tempo de resolução"
          value={`${indicadoresAtendimento.tempoResolucaoHoras} h`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Conversas no período"
          value={conversasPorAtendente.reduce((s, a) => s + a.conversas, 0)}
          icon={TrendingUp}
        />
        <StatCard
          label="Canal com mais volume"
          value={indicadoresAtendimento.volumePorCanal[0]?.canal ?? "—"}
          icon={Percent}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Volume por canal" className="xl:col-span-1">
          <ChartContainer config={canalConfig} className="mx-auto aspect-square h-64 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={indicadoresAtendimento.volumePorCanal}
                dataKey="conversas"
                nameKey="canal"
                innerRadius={50}
                outerRadius={90}
              >
                {indicadoresAtendimento.volumePorCanal.map((_, i) => (
                  <Cell key={i} fill={CORES_CANAL[i % CORES_CANAL.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </Panel>

        <Panel title="Conversas por atendente" className="xl:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atendente</TableHead>
                <TableHead className="text-right">Conversas</TableHead>
                <TableHead className="text-right">Tempo de resposta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversasPorAtendente.map((a) => (
                <TableRow key={a.atendente}>
                  <TableCell className="font-medium">{a.atendente}</TableCell>
                  <TableCell className="text-right">{a.conversas}</TableCell>
                  <TableCell className="text-right">{a.tempoRespostaMin} min</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">Vendas</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Negócios criados" value={indicadoresVendas.negociosCriados} icon={TrendingUp} />
        <StatCard label="Negócios ganhos" value={indicadoresVendas.negociosGanhos} icon={Trophy} />
        <StatCard label="Negócios perdidos" value={indicadoresVendas.negociosPerdidos} icon={XCircle} />
        <StatCard label="Taxa de conversão" value={`${indicadoresVendas.taxaConversao}%`} icon={Percent} />
        <StatCard label="Ticket médio" value={formatBRL(indicadoresVendas.ticketMedioCents)} icon={Coins} />
        <StatCard label="Valor no funil" value={formatBRL(indicadoresVendas.valorNoFunilCents)} icon={Wallet} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Ganhos x perdidos por semana" className="xl:col-span-2">
          <ChartContainer config={vendasConfig} className="aspect-auto h-64 w-full">
            <BarChart data={vendasPorSemana}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="semana" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="ganhos" fill="var(--color-ganhos)" radius={6} />
              <Bar dataKey="perdidos" fill="var(--color-perdidos)" radius={6} />
            </BarChart>
          </ChartContainer>
        </Panel>

        <Panel title="Desempenho por atendente">
          <div className="space-y-4">
            {desempenhoPorAtendente.map((a) => (
              <div key={a.atendente} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.atendente}</span>
                  <span className="text-muted-foreground">{a.taxaConversao}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {a.negociosGanhos} ganhos · {formatBRL(a.valorGeradoCents)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
