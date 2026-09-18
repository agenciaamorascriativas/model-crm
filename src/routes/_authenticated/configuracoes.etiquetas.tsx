import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { etiquetasDemo, coresMarcaDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/etiquetas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Etiquetas — Amoras CRM" },
      { name: "description", content: "Crie e organize etiquetas usadas em contatos e negócios." },
      { property: "og:title", content: "Etiquetas — Amoras CRM" },
      { property: "og:description", content: "Crie e organize etiquetas usadas em contatos e negócios." },
    ],
  }),
  component: EtiquetasPage,
});

type Etiqueta = (typeof etiquetasDemo)[number];

function EtiquetasPage() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>(etiquetasDemo);
  const [editando, setEditando] = useState<Etiqueta | null>(null);
  const [aberto, setAberto] = useState(false);

  function novaEtiqueta() {
    setEditando({ id: crypto.randomUUID(), nome: "", cor: coresMarcaDemo[0] ?? "#94a3b8", uso: 0 });
    setAberto(true);
  }

  function salvar() {
    if (!editando || !editando.nome.trim()) return;
    setEtiquetas((prev) => {
      const existe = prev.some((e) => e.id === editando.id);
      return existe ? prev.map((e) => (e.id === editando.id ? editando : e)) : [...prev, editando];
    });
    toast.success("Etiqueta salva.");
    setAberto(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etiquetas"
        description="Organize contatos e negócios com etiquetas coloridas."
        demo
        actions={
          <Button onClick={novaEtiqueta}>
            <Plus className="mr-2 h-4 w-4" /> Nova etiqueta
          </Button>
        }
      />

      <Panel title={`${etiquetas.length} etiquetas`}>
        <div className="space-y-2">
          {etiquetas.map((e) => (
            <div key={e.id} className="flex items-center gap-4 rounded-xl border p-3">
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: e.cor }} />
              <p className="flex-1 font-medium">{e.nome}</p>
              <p className="text-sm text-muted-foreground">{e.uso} usos</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditando(e);
                  setAberto(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEtiquetas((prev) => prev.filter((x) => x.id !== e.id));
                  toast.success("Etiqueta excluída.");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando?.uso ? "Editar etiqueta" : "Nova etiqueta"}</DialogTitle>
          </DialogHeader>
          {editando && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input
                  value={editando.nome}
                  onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {coresMarcaDemo.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditando({ ...editando, cor: c })}
                      className="h-8 w-8 rounded-full border-2"
                      style={{ backgroundColor: c, borderColor: editando.cor === c ? "currentColor" : "transparent" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
