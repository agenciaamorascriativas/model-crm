import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { modelosDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/modelos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Modelos e assinaturas — Amoras CRM" },
      { name: "description", content: "Modelos de e-mail e notas internas usados pela equipe." },
      { property: "og:title", content: "Modelos e assinaturas — Amoras CRM" },
      { property: "og:description", content: "Modelos de e-mail e notas internas usados pela equipe." },
    ],
  }),
  component: ModelosPage,
});

function ModelosPage() {
  const [selecionado, setSelecionado] = useState(modelosDemo[0]?.id ?? "");
  const atual = modelosDemo.find((m) => m.id === selecionado);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modelos e assinaturas"
        description="Modelos de e-mail e notas internas para agilizar o dia a dia."
        demo
        actions={
          <Button onClick={() => toast.success("Novo modelo criado (exemplo).")}>
            <Plus className="mr-2 h-4 w-4" /> Novo modelo
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Panel title="Modelos" className="lg:h-fit">
          <div className="space-y-1">
            {modelosDemo.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelecionado(m.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selecionado === m.id
                    ? "bg-secondary font-medium text-secondary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <p>{m.nome}</p>
                <Badge variant="outline" className="mt-1 font-normal">{m.canal}</Badge>
              </button>
            ))}
          </div>
        </Panel>

        {atual && (
          <Panel title="Prévia" description={atual.assunto}>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">
              {atual.preview}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => toast.success("Modelo editado (exemplo).")}>Editar</Button>
              <Button variant="outline" onClick={() => toast.success("Modelo excluído (exemplo).")}>Excluir</Button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
