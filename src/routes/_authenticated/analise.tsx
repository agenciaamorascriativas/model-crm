import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { PageHeader, PageContainer, Panel, formatBRL } from "@/components/page-shell";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  evolucaoMensal,
  comparacaoPeriodos,
  motivosPerda,
  origemContatos,
  desempenhoPorEtiqueta,
  mapaHorarios,
} from "@/lib/demo/relatorios";

export const Route = createFileRoute("/_authenticated/analise")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Análise — Amoras CRM" },
      { name: "description", content: "Visão detalhada de evolução, perdas, origem e horários de movimento." },
      { property: "og:title", content: "Análise — Amoras CRM" },
      { property: "og:description", content: "Visão detalhada de evolução, perdas, origem e horários de movimento." },
    ],
  }),
  component: AnalisePage,
});

const evolucaoConfig = {
  negocios: { label: "Negócios", color: "var(--chart-2)" },
} satisfies ChartConfig;

const perdaConfig = {
  quantidade: { label: "Negócios perdidos", color: "var(--chart-1)" },
} satisfies ChartConfig;

function VariacaoBadge({ atual, anterior }: { atual: number; anterior: number }) {
  const diff = ((atual - anterior) / anterior) * 100;
  const positivo = diff >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        positivo ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
      )}
    >
      {positivo ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

function AnalisePage() {
  const maiorMotivo = Math.max(...motivosPerda.map((m) => m.quantidade));
  const totalOrigem = origemContatos.reduce((s, o) => s + o.quantidade, 0);

  return (
    <PageContainer wide>
      <PageHeader
        title="Análise"
        description="Uma visão mais profunda do desempenho do CRM ao longo do tempo."
        demo
      />

      <Panel title="Evolução mês a mês" description="Negócios criados por mês">
        <ChartContainer config={evolucaoConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={evolucaoMensal}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="negocios"
              type="monotone"
              fill="var(--color-negocios)"
              fillOpacity={0.25}
              stroke="var(--color-negocios)"
            />
          </AreaChart>
        </ChartContainer>
      </Panel>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Comparação de períodos">
          <div className="space-y-4">
            {(["negocios", "valorCents", "conversao"] as const).map((chave) => {
              const rotulo = { negocios: "Negócios", valorCents: "Valor gerado", conversao: "Taxa de conversão" }[
                chave
              ];
              const atual = comparacaoPeriodos.atual[chave];
              const anterior = comparacaoPeriodos.anterior[chave];
              const formatar = (v: number) => (chave === "valorCents" ? formatBRL(v) : chave === "conversao" ? `${v}%` : v);
              return (
                <div key={chave} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{rotulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {comparacaoPeriodos.anterior.nome}: {formatar(anterior)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold">{formatar(atual)}</p>
                    <VariacaoBadge atual={atual} anterior={anterior} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Motivos de perda" description="Ranking do período" className="xl:col-span-2">
          <div className="space-y-3">
            {motivosPerda.map((m) => (
              <div key={m.motivo}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{m.motivo}</span>
                  <span className="text-muted-foreground">{m.quantidade}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(m.quantidade / maiorMotivo) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Origem dos contatos">
          <div className="space-y-3">
            {origemContatos.map((o) => (
              <div key={o.origem} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: o.cor }} />
                <span className="flex-1 text-sm">{o.origem}</span>
                <span className="text-sm font-medium">{o.quantidade}</span>
                <span className="w-12 text-right text-xs text-muted-foreground">
                  {((o.quantidade / totalOrigem) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Desempenho por etiqueta">
          <ChartContainer config={perdaConfig} className="aspect-auto h-56 w-full">
            <BarChart data={desempenhoPorEtiqueta} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis dataKey="etiqueta" type="category" tickLine={false} axisLine={false} width={110} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="negocios" fill="var(--chart-3)" radius={6} />
            </BarChart>
          </ChartContainer>
        </Panel>
      </div>

      <Panel title="Mapa de horários" description="Momentos de maior movimento na semana" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-center text-xs">
            <thead>
              <tr>
                <th className="w-16" />
                {mapaHorarios.horarios.map((h) => (
                  <th key={h} className="pb-1 font-normal text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mapaHorarios.dias.map((dia, di) => (
                <tr key={dia}>
                  <td className="pr-2 text-right font-medium text-muted-foreground">{dia}</td>
                  {(mapaHorarios.intensidade[di] ?? []).map((valor, hi) => (
                    <td key={hi}>
                      <div
                        className="mx-auto h-8 w-full min-w-8 rounded-md bg-primary"
                        style={{ opacity: valor }}
                        title={`${dia} ${mapaHorarios.horarios[hi]} — intensidade ${Math.round(valor * 100)}%`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageContainer>
  );
}
