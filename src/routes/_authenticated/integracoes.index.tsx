import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { conexoesDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/integracoes/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conexões — Amoras CRM" },
      { name: "description", content: "Integrações disponíveis para o seu CRM." },
      { property: "og:title", content: "Conexões — Amoras CRM" },
      { property: "og:description", content: "Integrações disponíveis para o seu CRM." },
    ],
  }),
  component: ConexoesPage,
});

function ConexoesPage() {
  const [conexoes, setConexoes] = useState(conexoesDemo);

  return (
    <div className="space-y-6">
      <PageHeader title="Conexões" description="Integre o CRM com outras ferramentas." demo />

      <div className="grid gap-4 sm:grid-cols-2">
        {conexoes.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-semibold">{c.nome}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.descricao}</p>
              </div>
              <Badge variant={c.conectado ? "secondary" : "outline"}>
                {c.conectado ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.id === "chat-site" && (
                <Button variant="default" size="sm" asChild>
                  <Link to="/integracoes/chat-site">Configurar</Link>
                </Button>
              )}
              <Button
                variant={c.conectado ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  setConexoes((prev) =>
                    prev.map((x) => (x.id === c.id ? { ...x, conectado: !x.conectado } : x)),
                  );
                  toast.success(c.conectado ? "Integração desconectada." : "Integração conectada (exemplo).");
                }}
              >
                {c.conectado ? "Desconectar" : "Conectar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
