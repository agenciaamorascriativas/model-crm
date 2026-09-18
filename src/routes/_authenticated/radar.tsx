import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Radar as RadarIcon } from "lucide-react";
import { alertasRadar, type SeverityLevel } from "@/lib/demo/relatorios";

export const Route = createFileRoute("/_authenticated/radar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Radar — Amoras CRM" },
      { name: "description", content: "Alertas do que precisa de atenção no seu CRM." },
      { property: "og:title", content: "Radar — Amoras CRM" },
      { property: "og:description", content: "Alertas do que precisa de atenção no seu CRM." },
    ],
  }),
  component: RadarPage,
});

const gravidadeInfo: Record<SeverityLevel, { rotulo: string; variante: "destructive" | "secondary" | "outline" }> = {
  alta: { rotulo: "Alta", variante: "destructive" },
  media: { rotulo: "Média", variante: "secondary" },
  baixa: { rotulo: "Baixa", variante: "outline" },
};

function RadarPage() {
  const contagem = {
    alta: alertasRadar.filter((a) => a.gravidade === "alta").length,
    media: alertasRadar.filter((a) => a.gravidade === "media").length,
    baixa: alertasRadar.filter((a) => a.gravidade === "baixa").length,
  };

  return (
    <PageContainer wide>
      <PageHeader
        title="Radar"
        description="Pontos que merecem sua atenção agora, em ordem de importância."
        demo
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
          <RadarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{alertasRadar.length}</span> alertas ativos
        </div>
        <Badge variant="destructive">{contagem.alta} de alta gravidade</Badge>
        <Badge variant="secondary">{contagem.media} de média gravidade</Badge>
        <Badge variant="outline">{contagem.baixa} de baixa gravidade</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {alertasRadar.map((alerta) => {
          const info = gravidadeInfo[alerta.gravidade];
          return (
            <Panel key={alerta.id} className={cn(alerta.gravidade === "alta" && "border-destructive/40")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4",
                      alerta.gravidade === "alta" ? "text-destructive" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {alerta.categoria}
                  </span>
                </div>
                <Badge variant={info.variante}>{info.rotulo}</Badge>
              </div>
              <p className="mt-3 font-display text-base font-semibold leading-snug">{alerta.titulo}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{alerta.explicacao}</p>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-xs">
                  <span className="font-medium">Ação sugerida:</span> {alerta.acaoSugerida}
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Resolver agora <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Panel>
          );
        })}
      </div>
    </PageContainer>
  );
}
