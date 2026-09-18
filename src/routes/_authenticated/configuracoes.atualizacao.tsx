import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { historicoVersoesDemo, novidadesVersaoAtualDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/atualizacao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Atualização do sistema — Amoras CRM" },
      { name: "description", content: "Versão instalada, novidades e histórico de atualizações." },
      { property: "og:title", content: "Atualização do sistema — Amoras CRM" },
      { property: "og:description", content: "Versão instalada, novidades e histórico de atualizações." },
    ],
  }),
  component: AtualizacaoPage,
});

function AtualizacaoPage() {
  const [verificando, setVerificando] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Atualização do sistema" description="Mantenha o CRM sempre atualizado." demo />

      <Panel title="Versão instalada">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Versão 2.4.0</Badge>
            <span className="text-sm text-muted-foreground">Atualizado em 10/05/2025</span>
          </div>
          <Button
            variant="outline"
            disabled={verificando}
            onClick={() => {
              setVerificando(true);
              setTimeout(() => {
                setVerificando(false);
                toast.success("Você já está usando a versão mais recente.");
              }, 900);
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> {verificando ? "Verificando..." : "Verificar atualizações"}
          </Button>
        </div>
      </Panel>

      <Panel title="Novidades desta versão">
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {novidadesVersaoAtualDemo.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Histórico de versões">
        <div className="space-y-3">
          {historicoVersoesDemo.map((v) => (
            <div key={v.versao} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Versão {v.versao}</p>
                <span className="text-sm text-muted-foreground">{v.data}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{v.destaque}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
