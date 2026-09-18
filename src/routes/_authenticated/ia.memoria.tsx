import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Brain, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { memoriasContatos as memoriasIniciais, type MemoriaContato } from "@/lib/demo/ia";

export const Route = createFileRoute("/_authenticated/ia/memoria")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Memória da IA — Amoras CRM" },
      { name: "description", content: "O que a IA lembra sobre cada contato." },
      { property: "og:title", content: "Memória da IA — Amoras CRM" },
      { property: "og:description", content: "O que a IA lembra sobre cada contato." },
    ],
  }),
  component: MemoriaPage,
});

function MemoriaPage() {
  const [memorias, setMemorias] = useState<MemoriaContato[]>(memoriasIniciais);
  const [retencao, setRetencao] = useState("90");
  const [limparContato, setLimparContato] = useState<MemoriaContato | null>(null);

  function apagarFato(contatoId: string, fatoId: string) {
    setMemorias((prev) =>
      prev.map((m) =>
        m.id === contatoId ? { ...m, fatos: m.fatos.filter((f) => f.id !== fatoId) } : m,
      ),
    );
    toast.success("Fato apagado da memória.");
  }

  function limparMemoria(contatoId: string) {
    setMemorias((prev) => prev.map((m) => (m.id === contatoId ? { ...m, fatos: [] } : m)));
    toast.success("Memória do contato foi limpa.");
    setLimparContato(null);
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Memória"
        description="Informações que a IA guarda sobre cada contato para personalizar o atendimento."
        demo
      />

      <Panel className="mb-6" title="Retenção de memória" description="Por quanto tempo a IA guarda os fatos aprendidos">
        <div className="flex items-center gap-3">
          <Label className="text-sm">Manter fatos por</Label>
          <Select value={retencao} onValueChange={setRetencao}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="180">180 dias</SelectItem>
              <SelectItem value="indefinido">Indefinidamente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Panel>

      <div className="space-y-4">
        {memorias.map((m) => (
          <Panel key={m.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold">{m.contato}</p>
                  <p className="text-sm text-muted-foreground">{m.resumo}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={m.fatos.length === 0}
                onClick={() => setLimparContato(m)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Limpar memória
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {m.fatos.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum fato memorizado.</p>
              )}
              {m.fatos.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                  <div className="flex items-start gap-2">
                    <Brain className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{f.fato}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.origem} · {new Date(f.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => apagarFato(m.id, f.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <AlertDialog open={!!limparContato} onOpenChange={(o) => !o && setLimparContato(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar memória do contato?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os fatos memorizados sobre {limparContato?.contato} serão apagados. Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => limparContato && limparMemoria(limparContato.id)}>
              Limpar memória
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
