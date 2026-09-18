import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel, StatCard, formatBRL } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { MessageSquare, Coins, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  CONSUMO_DIARIO,
  CONSUMO_POR_AGENTE,
  CONSUMO_POR_MODELO,
  CUSTO_MES_ATUAL_CENTAVOS,
  CUSTO_MES_ANTERIOR_CENTAVOS,
  MENSAGENS_MES_ATUAL,
  MENSAGENS_MES_ANTERIOR,
  TOKENS_MES_ATUAL,
  TOKENS_MES_ANTERIOR,
  LIMITE_MENSAL_PADRAO_CENTAVOS,
} from "@/lib/demo/ia-operacao";

export const Route = createFileRoute("/_authenticated/ia/consumo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Consumo — Amoras CRM" },
      { name: "description", content: "Acompanhe o consumo de IA do mês e defina limites." },
      { property: "og:title", content: "Consumo — Amoras CRM" },
      { property: "og:description", content: "Acompanhe o consumo de IA do mês e defina limites." },
    ],
  }),
  component: ConsumoPage,
});

const chartConfig: ChartConfig = {
  mensagens: { label: "Mensagens", color: "hsl(var(--primary))" },
};

function variacao(atual: number, anterior: number) {
  const diff = ((atual - anterior) / anterior) * 100;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% vs mês anterior`;
}

function ConsumoPage() {
  const [limite, setLimite] = useState(LIMITE_MENSAL_PADRAO_CENTAVOS / 100);

  const percentualUso = Math.min(100, Math.round((CUSTO_MES_ATUAL_CENTAVOS / (limite * 100)) * 100));

  return (
    <PageContainer wide>
      <PageHeader
        title="Consumo"
        description="Indicadores de uso da IA no mês, por agente e por modelo."
        demo
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Mensagens processadas"
          value={MENSAGENS_MES_ATUAL.toLocaleString("pt-BR")}
          hint={variacao(MENSAGENS_MES_ATUAL, MENSAGENS_MES_ANTERIOR)}
          icon={MessageSquare}
        />
        <StatCard
          label="Tokens utilizados"
          value={TOKENS_MES_ATUAL.toLocaleString("pt-BR")}
          hint={variacao(TOKENS_MES_ATUAL, TOKENS_MES_ANTERIOR)}
          icon={TrendingUp}
        />
        <StatCard
          label="Custo estimado"
          value={formatBRL(CUSTO_MES_ATUAL_CENTAVOS)}
          hint={variacao(CUSTO_MES_ATUAL_CENTAVOS, CUSTO_MES_ANTERIOR_CENTAVOS)}
          icon={Coins}
        />
        <StatCard label="Limite mensal" value={formatBRL(limite * 100)} hint={`${percentualUso}% utilizado`} />
      </div>

      {percentualUso >= 80 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Consumo próximo do limite</AlertTitle>
          <AlertDescription>
            Você já utilizou {percentualUso}% do limite mensal definido para a IA.
          </AlertDescription>
        </Alert>
      )}

      <Panel title="Consumo diário" description="Mensagens processadas por dia" className="mb-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <BarChart data={CONSUMO_DIARIO}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="mensagens" fill="var(--color-mensagens)" radius={4} />
          </BarChart>
        </ChartContainer>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Consumo por agente">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Mensagens</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONSUMO_POR_AGENTE.map((a) => (
                <TableRow key={a.agente}>
                  <TableCell className="font-medium">{a.agente}</TableCell>
                  <TableCell>{a.mensagens.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{a.tokens.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{formatBRL(a.custoCentavos)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Consumo por modelo">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Mensagens</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONSUMO_POR_MODELO.map((m) => (
                <TableRow key={m.modelo}>
                  <TableCell className="font-medium">{m.modelo}</TableCell>
                  <TableCell>{m.mensagens.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{m.tokens.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{formatBRL(m.custoCentavos)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>

      <Panel title="Limite mensal" description="Defina um limite de gasto para receber alertas" className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Limite mensal (R$)</Label>
            <Input
              type="number"
              min={0}
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value) || 0)}
              className="w-40"
            />
          </div>
          <Button onClick={() => toast.success("Limite mensal atualizado.")}>Salvar limite</Button>
        </div>
        <Progress value={percentualUso} className="mt-4" />
        <p className="mt-1 text-xs text-muted-foreground">
          {formatBRL(CUSTO_MES_ATUAL_CENTAVOS)} de {formatBRL(limite * 100)} utilizados neste mês.
        </p>
      </Panel>
    </PageContainer>
  );
}
