import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PASSOS_PRIMEIROS } from "@/lib/demo/apoio";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/primeiros-passos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Primeiros passos — Amoras CRM" },
      { name: "description", content: "Configure seu CRM em poucas etapas." },
      { property: "og:title", content: "Primeiros passos — Amoras CRM" },
      { property: "og:description", content: "Configure seu CRM em poucas etapas." },
    ],
  }),
  component: PrimeirosPassosPage,
});

function PrimeirosPassosPage() {
  const concluidos = PASSOS_PRIMEIROS.filter((p) => p.concluido).length;
  const progresso = Math.round((concluidos / PASSOS_PRIMEIROS.length) * 100);

  return (
    <PageContainer>
      <PageHeader
        title="Primeiros passos"
        description="Complete estas etapas para deixar seu CRM pronto para o dia a dia da equipe."
      />

      <Panel className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {concluidos} de {PASSOS_PRIMEIROS.length} etapas concluídas
            </p>
            <p className="text-sm text-muted-foreground">
              Continue de onde parou para aproveitar todo o potencial do sistema.
            </p>
          </div>
          <Badge variant={progresso === 100 ? "default" : "secondary"} className="font-normal">
            {progresso}% concluído
          </Badge>
        </div>
        <Progress value={progresso} className="mt-4" />
      </Panel>

      <div className="space-y-3">
        {PASSOS_PRIMEIROS.map((passo, i) => (
          <div
            key={passo.id}
            className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              {passo.concluido ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Etapa {i + 1}
                </p>
                <h2 className="font-display text-base font-semibold">{passo.titulo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{passo.descricao}</p>
              </div>
            </div>
            <Button asChild variant={passo.concluido ? "outline" : "default"} className="shrink-0">
              <Link to={passo.to}>
                {passo.acao}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
