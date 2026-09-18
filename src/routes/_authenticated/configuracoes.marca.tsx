import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImagePlus, LayoutDashboard, MessageCircle } from "lucide-react";
import { coresMarcaDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/marca")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Marca — Amoras CRM" },
      { name: "description", content: "Identidade visual do sistema: nome, logo, ícone e cores." },
      { property: "og:title", content: "Marca — Amoras CRM" },
      { property: "og:description", content: "Identidade visual do sistema: nome, logo, ícone e cores." },
    ],
  }),
  component: MarcaPage,
});

function MarcaPage() {
  const [nome, setNome] = useState("Amoras CRM");
  const [cor, setCor] = useState(coresMarcaDemo[0]);

  return (
    <div className="space-y-6">
      <PageHeader title="Marca" description="Como o sistema aparece para toda a equipe." demo />

      <Panel title="Nome do sistema">
        <div className="max-w-md space-y-1.5">
          <Label>Nome exibido</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
      </Panel>

      <Panel title="Logo e ícone">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Logo (menu lateral)</Label>
            <div className="flex h-24 items-center justify-center rounded-xl border border-dashed bg-muted/40">
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success("Logo enviada (exemplo).")}>
              Enviar logo
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Ícone (aba do navegador)</Label>
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed bg-muted/40">
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success("Ícone enviado (exemplo).")}>
              Enviar ícone
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title="Cor principal">
        <div className="flex flex-wrap gap-3">
          {coresMarcaDemo.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCor(c)}
              className={cn(
                "h-10 w-10 rounded-full border-2 transition-transform",
                cor === c ? "scale-110 border-foreground" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Prévia — tela de login">
          <div className="overflow-hidden rounded-xl border">
            <div className="flex h-40 flex-col items-center justify-center gap-2" style={{ backgroundColor: cor + "1a" }}>
              <div className="h-9 w-9 rounded-lg" style={{ backgroundColor: cor }} />
              <p className="font-display text-sm font-semibold">{nome}</p>
              <div className="h-8 w-40 rounded-md border bg-card" />
              <div className="h-8 w-40 rounded-md" style={{ backgroundColor: cor }} />
            </div>
          </div>
        </Panel>
        <Panel title="Prévia — menu lateral">
          <div className="overflow-hidden rounded-xl border">
            <div className="flex h-40">
              <div className="flex w-14 flex-col items-center gap-3 border-r bg-card py-3">
                <div className="h-6 w-6 rounded-md" style={{ backgroundColor: cor }} />
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <MessageCircle className="h-4 w-4" style={{ color: cor }} />
              </div>
              <div className="flex-1 bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">{nome}</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Identidade visual salva (exemplo).")}>Salvar</Button>
      </div>
    </div>
  );
}
