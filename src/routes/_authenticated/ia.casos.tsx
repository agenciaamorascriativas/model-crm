import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, ShieldAlert, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { casosIA as casosIniciais, type CasoIA, type StatusCaso } from "@/lib/demo/ia";

export const Route = createFileRoute("/_authenticated/ia/casos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Casos da IA — Amoras CRM" },
      { name: "description", content: "Situações em que a IA errou ou pediu ajuda." },
      { property: "og:title", content: "Casos da IA — Amoras CRM" },
      { property: "og:description", content: "Situações em que a IA errou ou pediu ajuda." },
    ],
  }),
  component: CasosPage,
});

const LABEL_STATUS: Record<StatusCaso, string> = {
  aberto: "Aberto",
  em_revisao: "Em revisão",
  resolvido: "Resolvido",
};

function badgeVariante(status: StatusCaso) {
  if (status === "resolvido") return "default" as const;
  if (status === "em_revisao") return "secondary" as const;
  return "destructive" as const;
}

function CasosPage() {
  const [casos, setCasos] = useState<CasoIA[]>(casosIniciais);
  const [revisando, setRevisando] = useState<CasoIA | null>(null);

  function salvarRevisao(id: string, respostaCorreta: string) {
    setCasos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, respostaCorreta, status: "resolvido" } : c)),
    );
    toast.success("A IA foi ensinada com a resposta correta.");
    setRevisando(null);
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Casos"
        description="Momentos em que a IA errou, pediu ajuda ou precisa de revisão humana."
        demo
      />

      <div className="space-y-4">
        {casos.map((c) => (
          <Panel key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold">{c.contato}</p>
                  <p className="text-sm text-muted-foreground">{c.motivo}</p>
                </div>
              </div>
              <Badge variant={badgeVariante(c.status)}>{LABEL_STATUS[c.status]}</Badge>
            </div>

            <p className="mt-3 text-sm">{c.resumoConversa}</p>

            <div className="mt-3 flex items-start gap-2 rounded-xl border bg-muted/40 p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{c.acaoSugerida}</p>
            </div>

            {c.respostaCorreta && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Resposta correta ensinada</p>
                  <p className="text-sm">{c.respostaCorreta}</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(c.data).toLocaleDateString("pt-BR")}
              </p>
              {c.status !== "resolvido" && (
                <Button variant="outline" size="sm" onClick={() => setRevisando(c)}>
                  Revisar caso
                </Button>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {revisando && (
        <RevisaoDialog
          caso={revisando}
          onClose={() => setRevisando(null)}
          onSave={(resposta) => salvarRevisao(revisando.id, resposta)}
        />
      )}
    </PageContainer>
  );
}

function RevisaoDialog({
  caso,
  onClose,
  onSave,
}: {
  caso: CasoIA;
  onClose: () => void;
  onSave: (respostaCorreta: string) => void;
}) {
  const [resposta, setResposta] = useState(caso.respostaCorreta ?? "");

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Revisar caso — {caso.contato}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{caso.resumoConversa}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Escreva a resposta correta para ensinar a IA</Label>
            <Textarea
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              rows={5}
              placeholder="Descreva como a IA deveria ter respondido ou agido"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!resposta.trim()} onClick={() => onSave(resposta)}>
            Salvar e marcar como resolvido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
