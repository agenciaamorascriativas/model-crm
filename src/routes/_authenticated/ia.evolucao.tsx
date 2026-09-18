import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer, PageHeader, Panel, StatCard } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EVOLUCAO_MENSAL,
  MELHORIAS_APLICADAS,
  VERSOES_INSTRUCOES,
} from "@/lib/demo/ia-operacao";
import { LineChart, Sparkles, ThumbsUp, TrendingDown, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ia/evolucao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Evolução da IA — Amoras CRM" },
      {
        name: "description",
        content: "Acompanhe a qualidade das respostas da IA ao longo dos meses.",
      },
      { property: "og:title", content: "Evolução da IA — Amoras CRM" },
      {
        property: "og:description",
        content: "Acompanhe a qualidade das respostas da IA ao longo dos meses.",
      },
    ],
  }),
  component: EvolucaoPage,
});

type Metrica = "taxaResolucao" | "satisfacao" | "transferenciasHumano" | "errosCorrigidos";

const METRICAS: { chave: Metrica; label: string; sufixo?: string }[] = [
  { chave: "taxaResolucao", label: "Resolução sem humano", sufixo: "%" },
  { chave: "satisfacao", label: "Satisfação (de 1 a 5)" },
  { chave: "transferenciasHumano", label: "Transferências para humano" },
  { chave: "errosCorrigidos", label: "Erros corrigidos" },
];

function EvolucaoPage() {
  const [metrica, setMetrica] = useState<Metrica>("taxaResolucao");

  const ultimo = EVOLUCAO_MENSAL[EVOLUCAO_MENSAL.length - 1];
  const primeiro = EVOLUCAO_MENSAL[0];
  const valores = EVOLUCAO_MENSAL.map((p) => p[metrica]);
  const maximo = Math.max(...valores, 1);
  const metricaAtual = METRICAS.find((m) => m.chave === metrica);

  return (
    <PageContainer wide>
      <PageHeader
        title="Evolução da IA"
        description="Como a inteligência artificial vem melhorando mês a mês, com o que já foi ensinado a ela."
        demo
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Resolução sem humano"
          value={`${ultimo?.taxaResolucao ?? 0}%`}
          hint={`Era ${primeiro?.taxaResolucao ?? 0}% no início do período`}
          icon={Sparkles}
        />
        <StatCard
          label="Satisfação"
          value={`${ultimo?.satisfacao ?? 0} / 5`}
          hint={`Era ${primeiro?.satisfacao ?? 0} no início`}
          icon={ThumbsUp}
        />
        <StatCard
          label="Transferências para humano"
          value={ultimo?.transferenciasHumano ?? 0}
          hint="Quanto menor, mais a IA resolveu sozinha"
          icon={Users}
        />
        <StatCard
          label="Erros corrigidos no mês"
          value={ultimo?.errosCorrigidos ?? 0}
          hint="Casos revisados e ensinados à IA"
          icon={TrendingDown}
        />
      </div>

      <Panel
        className="mt-6"
        title="Tendência"
        description={metricaAtual?.label}
        actions={
          <div className="flex flex-wrap gap-1">
            {METRICAS.map((m) => (
              <Button
                key={m.chave}
                size="sm"
                variant={m.chave === metrica ? "default" : "outline"}
                onClick={() => setMetrica(m.chave)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        }
      >
        <div className="flex h-56 items-end gap-4">
          {EVOLUCAO_MENSAL.map((ponto) => {
            const valor = ponto[metrica];
            const altura = Math.max(6, Math.round((valor / maximo) * 100));
            return (
              <div key={ponto.mes} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {valor}
                  {metricaAtual?.sufixo ?? ""}
                </span>
                <div
                  className="w-full rounded-t-lg bg-primary/80"
                  style={{ height: `${altura}%` }}
                />
                <span className="text-xs text-muted-foreground">{ponto.mes}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      <Tabs defaultValue="melhorias" className="mt-6">
        <TabsList>
          <TabsTrigger value="melhorias">Melhorias aplicadas</TabsTrigger>
          <TabsTrigger value="versoes">Versões das instruções</TabsTrigger>
        </TabsList>

        <TabsContent value="melhorias" className="mt-4">
          <Panel title="O que já foi ensinado à IA">
            <ul className="space-y-4">
              {MELHORIAS_APLICADAS.map((m, i) => (
                <li key={m.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{m.titulo}</p>
                    <Badge variant="secondary">{m.agente}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.descricao}</p>
                  {i < MELHORIAS_APLICADAS.length - 1 && <Separator className="mt-4" />}
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>

        <TabsContent value="versoes" className="mt-4">
          <Panel
            title="Histórico de versões"
            description="Cada vez que as instruções de um agente mudam, uma nova versão é registrada."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versão</TableHead>
                  <TableHead>Agente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Resumo da mudança</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VERSOES_INSTRUCOES.map((v) => (
                  <TableRow key={v.versao}>
                    <TableCell className="font-medium">{v.versao}</TableCell>
                    <TableCell>{v.agente}</TableCell>
                    <TableCell>{new Date(v.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-muted-foreground">{v.resumo}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <LineChart className="mr-2 h-4 w-4" />
                        Comparar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
