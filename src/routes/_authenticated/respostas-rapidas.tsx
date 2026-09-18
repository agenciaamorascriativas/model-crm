import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, PageContainer, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Search, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  CATEGORIAS_RESPOSTAS,
  RESPOSTAS_RAPIDAS,
  type RespostaRapida,
} from "@/lib/demo/atendimento";

export const Route = createFileRoute("/_authenticated/respostas-rapidas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Respostas rápidas — Amoras CRM" },
      { name: "description", content: "Mensagens prontas para agilizar o atendimento." },
      { property: "og:title", content: "Respostas rápidas — Amoras CRM" },
      { property: "og:description", content: "Mensagens prontas para agilizar o atendimento." },
    ],
  }),
  component: RespostasRapidasPage,
});

const RESPOSTA_VAZIA = {
  nome: "",
  atalho: "",
  categoria: CATEGORIAS_RESPOSTAS[0] ?? "Geral",
  mensagem: "",
};

function RespostasRapidasPage() {
  const [respostas, setRespostas] = useState<RespostaRapida[]>(RESPOSTAS_RAPIDAS);
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<RespostaRapida | null>(null);
  const [form, setForm] = useState(RESPOSTA_VAZIA);
  const [excluirAlvo, setExcluirAlvo] = useState<RespostaRapida | null>(null);

  const respostasFiltradas = respostas.filter((r) => {
    const termo = busca.toLowerCase();
    return (
      r.nome.toLowerCase().includes(termo) ||
      r.atalho.toLowerCase().includes(termo) ||
      r.mensagem.toLowerCase().includes(termo)
    );
  });

  const agrupadas = useMemo(() => {
    const grupos = new Map<string, RespostaRapida[]>();
    for (const r of respostasFiltradas) {
      const lista = grupos.get(r.categoria) ?? [];
      lista.push(r);
      grupos.set(r.categoria, lista);
    }
    return grupos;
  }, [respostasFiltradas]);

  function abrirNova() {
    setEditando(null);
    setForm(RESPOSTA_VAZIA);
    setDialogAberto(true);
  }

  function abrirEdicao(resposta: RespostaRapida) {
    setEditando(resposta);
    setForm({
      nome: resposta.nome,
      atalho: resposta.atalho,
      categoria: resposta.categoria,
      mensagem: resposta.mensagem,
    });
    setDialogAberto(true);
  }

  function salvar() {
    if (!form.nome || !form.atalho || !form.mensagem) {
      toast.error("Preencha nome, atalho e mensagem.");
      return;
    }
    if (editando) {
      setRespostas((prev) =>
        prev.map((r) => (r.id === editando.id ? { ...r, ...form } : r)),
      );
      toast.success("Resposta rápida atualizada");
    } else {
      setRespostas((prev) => [
        ...prev,
        { id: `resp-${Date.now()}`, usos: 0, ...form },
      ]);
      toast.success("Resposta rápida criada");
    }
    setDialogAberto(false);
  }

  function confirmarExclusao() {
    if (!excluirAlvo) return;
    setRespostas((prev) => prev.filter((r) => r.id !== excluirAlvo.id));
    toast.success("Resposta rápida excluída");
    setExcluirAlvo(null);
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Respostas rápidas"
        description="Mensagens prontas organizadas por categoria para agilizar o atendimento"
        demo
        actions={
          <Button onClick={abrirNova}>
            <Plus className="mr-2 h-4 w-4" /> Nova resposta
          </Button>
        }
      />

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, atalho ou conteúdo"
          className="pl-9"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {agrupadas.size === 0 ? (
        <EmptyState
          icon={Zap}
          title="Nenhuma resposta encontrada"
          description="Tente outro termo de busca ou crie uma nova resposta rápida."
        />
      ) : (
        <div className="space-y-8">
          {Array.from(agrupadas.entries()).map(([categoria, itens]) => (
            <div key={categoria}>
              <h2 className="mb-3 font-display text-base font-semibold">{categoria}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {itens.map((resposta) => (
                  <div key={resposta.id} className="flex flex-col rounded-2xl border bg-card p-4 shadow-sm">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{resposta.nome}</p>
                        <Badge variant="secondary" className="mt-1 font-mono text-xs font-normal">
                          {resposta.atalho}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => abrirEdicao(resposta)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setExcluirAlvo(resposta)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="flex-1 text-sm text-muted-foreground">{resposta.mensagem}</p>
                    <p className="mt-3 text-xs text-muted-foreground">Usada {resposta.usos} vezes</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar resposta rápida" : "Nova resposta rápida"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Atalho</Label>
                <Input
                  placeholder="/orcamento"
                  value={form.atalho}
                  onChange={(e) => setForm({ ...form, atalho: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_RESPOSTAS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mensagem</Label>
              <Textarea
                rows={4}
                placeholder="Use {{nome}} para personalizar a mensagem"
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis: <code className="font-mono">{"{{nome}}"}</code>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar}>{editando ? "Salvar alterações" : "Criar resposta"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!excluirAlvo} onOpenChange={(open) => !open && setExcluirAlvo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir resposta rápida?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A resposta "{excluirAlvo?.nome}" será removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
