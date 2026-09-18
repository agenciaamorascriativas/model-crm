import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer, PageHeader, Panel, StatCard, formatBRL } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GitBranch, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FUNIS as FUNIS_INICIAIS, NEGOCIOS, type Funil, type EtapaFunil } from "@/lib/demo/vendas";

export const Route = createFileRoute("/_authenticated/funis")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Funis e estágios — Amoras CRM" },
      { name: "description", content: "Organize os funis de vendas e seus estágios." },
      { property: "og:title", content: "Funis e estágios — Amoras CRM" },
      { property: "og:description", content: "Organize os funis de vendas e seus estágios." },
    ],
  }),
  component: FunisPage,
});

let contadorId = 1000;
const novoId = (prefixo: string) => `${prefixo}-${contadorId++}`;

function FunisPage() {
  const [funis, setFunis] = useState<Funil[]>(FUNIS_INICIAIS);
  const [selecionadoId, setSelecionadoId] = useState(FUNIS_INICIAIS[0]?.id ?? "");
  const [dialogFunil, setDialogFunil] = useState<{ modo: "criar" | "editar"; funil?: Funil } | null>(null);
  const [dialogEtapa, setDialogEtapa] = useState<{ modo: "criar" | "editar"; etapa?: EtapaFunil } | null>(null);
  const [excluirFunil, setExcluirFunil] = useState<Funil | null>(null);
  const [excluirEtapa, setExcluirEtapa] = useState<EtapaFunil | null>(null);

  const [nomeFunil, setNomeFunil] = useState("");
  const [nomeEtapa, setNomeEtapa] = useState("");
  const [corEtapa, setCorEtapa] = useState("#0ea5e9");
  const [probEtapa, setProbEtapa] = useState("25");

  const funilSelecionado = funis.find((f) => f.id === selecionadoId) ?? funis[0];

  const negociosDoFunil = (funilId: string) => NEGOCIOS.filter((n) => n.funilId === funilId && n.status === "aberto");

  const abrirCriarFunil = () => {
    setNomeFunil("");
    setDialogFunil({ modo: "criar" });
  };

  const abrirEditarFunil = (funil: Funil) => {
    setNomeFunil(funil.nome);
    setDialogFunil({ modo: "editar", funil });
  };

  const salvarFunil = () => {
    if (!nomeFunil.trim()) return;
    if (dialogFunil?.modo === "criar") {
      const novo: Funil = { id: novoId("funil"), nome: nomeFunil.trim(), padrao: false, etapas: [] };
      setFunis((prev) => [...prev, novo]);
      setSelecionadoId(novo.id);
      toast.success("Funil criado.");
    } else if (dialogFunil?.funil) {
      setFunis((prev) => prev.map((f) => (f.id === dialogFunil.funil!.id ? { ...f, nome: nomeFunil.trim() } : f)));
      toast.success("Funil atualizado.");
    }
    setDialogFunil(null);
  };

  const confirmarExclusaoFunil = () => {
    if (!excluirFunil) return;
    setFunis((prev) => prev.filter((f) => f.id !== excluirFunil.id));
    if (selecionadoId === excluirFunil.id) {
      setSelecionadoId(funis.find((f) => f.id !== excluirFunil.id)?.id ?? "");
    }
    toast("Funil excluído.");
    setExcluirFunil(null);
  };

  const abrirCriarEtapa = () => {
    setNomeEtapa("");
    setCorEtapa("#0ea5e9");
    setProbEtapa("25");
    setDialogEtapa({ modo: "criar" });
  };

  const abrirEditarEtapa = (etapa: EtapaFunil) => {
    setNomeEtapa(etapa.nome);
    setCorEtapa(etapa.cor);
    setProbEtapa(String(etapa.probabilidade));
    setDialogEtapa({ modo: "editar", etapa });
  };

  const salvarEtapa = () => {
    if (!nomeEtapa.trim() || !funilSelecionado) return;
    setFunis((prev) =>
      prev.map((f) => {
        if (f.id !== funilSelecionado.id) return f;
        if (dialogEtapa?.modo === "criar") {
          const nova: EtapaFunil = {
            id: novoId("etapa"),
            nome: nomeEtapa.trim(),
            cor: corEtapa,
            probabilidade: Number(probEtapa) || 0,
            ordem: f.etapas.length + 1,
          };
          return { ...f, etapas: [...f.etapas, nova] };
        }
        return {
          ...f,
          etapas: f.etapas.map((e) =>
            e.id === dialogEtapa?.etapa?.id
              ? { ...e, nome: nomeEtapa.trim(), cor: corEtapa, probabilidade: Number(probEtapa) || 0 }
              : e,
          ),
        };
      }),
    );
    toast.success(dialogEtapa?.modo === "criar" ? "Estágio criado." : "Estágio atualizado.");
    setDialogEtapa(null);
  };

  const confirmarExclusaoEtapa = () => {
    if (!excluirEtapa || !funilSelecionado) return;
    setFunis((prev) =>
      prev.map((f) =>
        f.id === funilSelecionado.id
          ? { ...f, etapas: f.etapas.filter((e) => e.id !== excluirEtapa.id).map((e, i) => ({ ...e, ordem: i + 1 })) }
          : f,
      ),
    );
    toast("Estágio excluído.");
    setExcluirEtapa(null);
  };

  const moverEtapa = (etapaId: string, direcao: -1 | 1) => {
    if (!funilSelecionado) return;
    setFunis((prev) =>
      prev.map((f) => {
        if (f.id !== funilSelecionado.id) return f;
        const ordenadas = [...f.etapas].sort((a, b) => a.ordem - b.ordem);
        const index = ordenadas.findIndex((e) => e.id === etapaId);
        const alvo = index + direcao;
        if (alvo < 0 || alvo >= ordenadas.length) return f;
        [ordenadas[index], ordenadas[alvo]] = [ordenadas[alvo], ordenadas[index]];
        return { ...f, etapas: ordenadas.map((e, i) => ({ ...e, ordem: i + 1 })) };
      }),
    );
  };

  return (
    <PageContainer wide>
      <PageHeader
        title="Funis e estágios"
        description="Organize os funis de vendas e as etapas de cada um."
        demo
        actions={
          <Button onClick={abrirCriarFunil}>
            <Plus className="mr-2 h-4 w-4" /> Novo funil
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {funis.map((funil) => {
            const negocios = negociosDoFunil(funil.id);
            const total = negocios.reduce((s, n) => s + n.valorCents, 0);
            return (
              <button
                key={funil.id}
                onClick={() => setSelecionadoId(funil.id)}
                className={cn(
                  "w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors",
                  funilSelecionado?.id === funil.id ? "border-primary ring-1 ring-primary" : "hover:bg-accent/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    {funil.nome}
                    {funil.padrao && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                  </span>
                  <div className="flex gap-1">
                    <span
                      role="button"
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEditarFunil(funil);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </span>
                    <span
                      role="button"
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExcluirFunil(funil);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {negocios.length} negócios · {formatBRL(total)}
                </p>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {funilSelecionado ? (
            <Panel
              title={`Estágios de ${funilSelecionado.nome}`}
              actions={
                <Button size="sm" onClick={abrirCriarEtapa}>
                  <Plus className="mr-2 h-4 w-4" /> Novo estágio
                </Button>
              }
            >
              <div className="space-y-2">
                {[...funilSelecionado.etapas]
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((etapa, index, arr) => (
                    <div key={etapa.id} className="flex items-center gap-3 rounded-xl border px-4 py-3">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: etapa.cor }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{etapa.nome}</p>
                        <p className="text-xs text-muted-foreground">Ordem {etapa.ordem}</p>
                      </div>
                      <Badge variant="secondary">{etapa.probabilidade}%</Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          disabled={index === 0}
                          onClick={() => moverEtapa(etapa.id, -1)}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          disabled={index === arr.length - 1}
                          onClick={() => moverEtapa(etapa.id, 1)}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => abrirEditarEtapa(etapa)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setExcluirEtapa(etapa)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {funilSelecionado.etapas.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">Nenhum estágio cadastrado.</p>
                )}
              </div>
            </Panel>
          ) : (
            <Panel title="Selecione um funil">
              <p className="text-sm text-muted-foreground">Escolha ou crie um funil para ver seus estágios.</p>
            </Panel>
          )}
        </div>
      </div>

      <Dialog open={dialogFunil !== null} onOpenChange={(open) => !open && setDialogFunil(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogFunil?.modo === "criar" ? "Novo funil" : "Editar funil"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Nome do funil</Label>
            <Input value={nomeFunil} onChange={(e) => setNomeFunil(e.target.value)} placeholder="Ex.: Funil de Onboarding" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogFunil(null)}>
              Cancelar
            </Button>
            <Button onClick={salvarFunil}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogEtapa !== null} onOpenChange={(open) => !open && setDialogEtapa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogEtapa?.modo === "criar" ? "Novo estágio" : "Editar estágio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nome do estágio</Label>
              <Input value={nomeEtapa} onChange={(e) => setNomeEtapa(e.target.value)} placeholder="Ex.: Proposta enviada" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input type="color" value={corEtapa} onChange={(e) => setCorEtapa(e.target.value)} className="h-9 w-full p-1" />
              </div>
              <div className="space-y-2">
                <Label>Probabilidade (%)</Label>
                <Input type="number" min={0} max={100} value={probEtapa} onChange={(e) => setProbEtapa(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEtapa(null)}>
              Cancelar
            </Button>
            <Button onClick={salvarEtapa}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={excluirFunil !== null} onOpenChange={(open) => !open && setExcluirFunil(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir funil "{excluirFunil?.nome}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Essa ação não pode ser desfeita nesta simulação.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcluirFunil(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarExclusaoFunil}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={excluirEtapa !== null} onOpenChange={(open) => !open && setExcluirEtapa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir estágio "{excluirEtapa?.nome}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Essa ação não pode ser desfeita nesta simulação.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcluirEtapa(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarExclusaoEtapa}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
