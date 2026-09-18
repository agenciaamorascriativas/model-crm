import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer, PageHeader, Panel, formatBRL } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Archive,
  ArchiveRestore,
  KanbanSquare,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, Pipeline, PipelineStage, StageRole } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/funis")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Funis e etapas — Amoras CRM" },
      { name: "description", content: "Visualize vários funis, ordene etapas e defina fechamento, perda e uso pelo assistente." },
      { property: "og:title", content: "Funis e etapas — Amoras CRM" },
      { property: "og:description", content: "Visualize vários funis, ordene etapas e defina fechamento, perda e uso pelo assistente." },
    ],
  }),
  component: FunisPage,
});

const PAPEL_LABEL: Record<StageRole, string> = {
  nenhum: "Etapa comum",
  fechamento: "Fechamento (ganho)",
  perda: "Perda",
};

const DIAS_PARADO = 7;

function slugify(name: string) {
  return (
    "/" +
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
  );
}

function FunisPage() {
  const queryClient = useQueryClient();
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);

  const [dialogFunil, setDialogFunil] = useState<{ modo: "criar" | "editar"; funil?: Pipeline } | null>(null);
  const [nomeFunil, setNomeFunil] = useState("");
  const [descFunil, setDescFunil] = useState("");
  const [apelidoFunil, setApelidoFunil] = useState("");

  const [dialogEtapa, setDialogEtapa] = useState<{ modo: "criar" | "editar"; etapa?: PipelineStage } | null>(null);
  const [nomeEtapa, setNomeEtapa] = useState("");
  const [corEtapa, setCorEtapa] = useState("#0ea5e9");
  const [papelEtapa, setPapelEtapa] = useState<StageRole>("nenhum");
  const [chaveAssistente, setChaveAssistente] = useState("");

  const [excluirEtapa, setExcluirEtapa] = useState<PipelineStage | null>(null);
  const [salvando, setSalvando] = useState(false);

  const { data: funis, isLoading } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as unknown as Pipeline[];
    },
  });

  const { data: etapas } = useQuery({
    queryKey: ["pipeline_stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as unknown as PipelineStage[];
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads", "resumo-funis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, pipeline_id, stage_id, status, value_cents, last_activity_at");
      if (error) throw error;
      return data as unknown as Pick<Lead, "id" | "pipeline_id" | "stage_id" | "status" | "value_cents"> &
        { last_activity_at: string }[];
    },
  });

  const listaFunis = useMemo(
    () => (funis ?? []).filter((f) => (mostrarArquivados ? true : !f.archived)),
    [funis, mostrarArquivados],
  );

  const selecionado = listaFunis.find((f) => f.id === selecionadoId) ?? listaFunis[0] ?? null;
  const etapasDoFunil = (etapas ?? [])
    .filter((e) => e.pipeline_id === selecionado?.id)
    .sort((a, b) => a.position - b.position);

  const linhas = (leads ?? []) as unknown as {
    id: string;
    pipeline_id: string | null;
    stage_id: string | null;
    status: string;
    value_cents: number;
    last_activity_at: string;
  }[];

  function resumo(funilId: string) {
    const etapasIds = (etapas ?? []).filter((e) => e.pipeline_id === funilId).map((e) => e.id);
    const doFunil = linhas.filter(
      (l) => l.pipeline_id === funilId || (l.stage_id && etapasIds.includes(l.stage_id)),
    );
    const abertos = doFunil.filter((l) => l.status === "aberto");
    const limite = Date.now() - DIAS_PARADO * 86400000;
    return {
      abertos: abertos.length,
      atrasados: abertos.filter((l) => new Date(l.last_activity_at).getTime() < limite).length,
      valor: abertos.reduce((s, l) => s + l.value_cents, 0),
    };
  }

  const invalidar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["pipelines"] });
    await queryClient.invalidateQueries({ queryKey: ["pipeline_stages"] });
  };

  // ---------- funis ----------
  function abrirCriarFunil() {
    setNomeFunil("");
    setDescFunil("");
    setApelidoFunil("");
    setDialogFunil({ modo: "criar" });
  }

  function abrirEditarFunil(funil: Pipeline) {
    setNomeFunil(funil.name);
    setDescFunil(funil.description ?? "");
    setApelidoFunil(funil.slug ?? "");
    setDialogFunil({ modo: "editar", funil });
  }

  async function salvarFunil() {
    if (!nomeFunil.trim()) {
      toast.error("Digite o nome do funil.");
      return;
    }
    setSalvando(true);
    const payload = {
      name: nomeFunil.trim(),
      description: descFunil.trim() || null,
      slug: (apelidoFunil.trim() || slugify(nomeFunil)).replace(/\s+/g, ""),
    };
    const error =
      dialogFunil?.modo === "editar" && dialogFunil.funil
        ? (await supabase.from("pipelines").update(payload).eq("id", dialogFunil.funil.id)).error
        : (
            await supabase.from("pipelines").insert({
              ...payload,
              position: (funis?.length ?? 0) + 1,
              is_default: (funis?.length ?? 0) === 0,
            })
          ).error;
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar o funil.");
      return;
    }
    await invalidar();
    toast.success(dialogFunil?.modo === "editar" ? "Funil atualizado." : "Funil criado.");
    setDialogFunil(null);
  }

  async function definirPadrao(funil: Pipeline) {
    await supabase.from("pipelines").update({ is_default: false }).neq("id", funil.id);
    const { error } = await supabase.from("pipelines").update({ is_default: true }).eq("id", funil.id);
    if (error) {
      toast.error("Não foi possível definir o funil padrão.");
      return;
    }
    await invalidar();
    toast.success(`"${funil.name}" agora é o funil padrão.`);
  }

  async function alternarArquivo(funil: Pipeline) {
    const { error } = await supabase.from("pipelines").update({ archived: !funil.archived }).eq("id", funil.id);
    if (error) {
      toast.error("Não foi possível alterar o funil.");
      return;
    }
    await invalidar();
    toast.success(funil.archived ? "Funil reativado." : "Funil arquivado.");
  }

  async function moverFunil(funil: Pipeline, direcao: -1 | 1) {
    const ordenados = [...(funis ?? [])].sort((a, b) => a.position - b.position);
    const i = ordenados.findIndex((f) => f.id === funil.id);
    const alvo = ordenados[i + direcao];
    if (!alvo) return;
    await supabase.from("pipelines").update({ position: alvo.position }).eq("id", funil.id);
    await supabase.from("pipelines").update({ position: funil.position }).eq("id", alvo.id);
    await invalidar();
  }

  // ---------- etapas ----------
  function abrirCriarEtapa() {
    setNomeEtapa("");
    setCorEtapa("#0ea5e9");
    setPapelEtapa("nenhum");
    setChaveAssistente("");
    setDialogEtapa({ modo: "criar" });
  }

  function abrirEditarEtapa(etapa: PipelineStage) {
    setNomeEtapa(etapa.name);
    setCorEtapa(etapa.color ?? "#0ea5e9");
    setPapelEtapa(etapa.stage_role ?? "nenhum");
    setChaveAssistente(etapa.assistant_key ?? "");
    setDialogEtapa({ modo: "editar", etapa });
  }

  async function salvarEtapa() {
    if (!selecionado) return;
    if (!nomeEtapa.trim()) {
      toast.error("Digite o nome da etapa.");
      return;
    }
    setSalvando(true);
    const payload = {
      name: nomeEtapa.trim(),
      color: corEtapa,
      stage_role: papelEtapa,
      assistant_key: chaveAssistente.trim() || null,
    };

    if (papelEtapa !== "nenhum") {
      // só uma etapa de fechamento e uma de perda por funil
      await supabase
        .from("pipeline_stages")
        .update({ stage_role: "nenhum" })
        .eq("pipeline_id", selecionado.id)
        .eq("stage_role", papelEtapa);
    }

    const error =
      dialogEtapa?.modo === "editar" && dialogEtapa.etapa
        ? (await supabase.from("pipeline_stages").update(payload).eq("id", dialogEtapa.etapa.id)).error
        : (
            await supabase.from("pipeline_stages").insert({
              ...payload,
              pipeline_id: selecionado.id,
              position: etapasDoFunil.length + 1,
            })
          ).error;
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar a etapa.");
      return;
    }
    await invalidar();
    toast.success(dialogEtapa?.modo === "editar" ? "Etapa atualizada." : "Etapa criada.");
    setDialogEtapa(null);
  }

  async function moverEtapa(etapa: PipelineStage, direcao: -1 | 1) {
    const i = etapasDoFunil.findIndex((e) => e.id === etapa.id);
    const alvo = etapasDoFunil[i + direcao];
    if (!alvo) return;
    await supabase.from("pipeline_stages").update({ position: alvo.position }).eq("id", etapa.id);
    await supabase.from("pipeline_stages").update({ position: etapa.position }).eq("id", alvo.id);
    await invalidar();
  }

  async function alternarArquivoEtapa(etapa: PipelineStage) {
    await supabase.from("pipeline_stages").update({ archived: !etapa.archived }).eq("id", etapa.id);
    await invalidar();
  }

  async function confirmarExclusaoEtapa() {
    if (!excluirEtapa) return;
    const { error } = await supabase.from("pipeline_stages").delete().eq("id", excluirEtapa.id);
    if (error) {
      toast.error("Não foi possível excluir. Mova os negócios desta etapa primeiro.");
    } else {
      await invalidar();
      toast.success("Etapa excluída.");
    }
    setExcluirEtapa(null);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando funis...
      </div>
    );
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Funis e etapas"
        description="Veja vários funis, defina o padrão e organize as etapas de cada um."
        actions={
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={mostrarArquivados} onCheckedChange={setMostrarArquivados} />
              Mostrar arquivados
            </label>
            <Button onClick={abrirCriarFunil}>
              <Plus className="mr-2 h-4 w-4" /> Novo funil
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {listaFunis.map((funil, index) => {
          const r = resumo(funil.id);
          const ativo = selecionado?.id === funil.id;
          return (
            <div
              key={funil.id}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-sm transition-colors",
                ativo && "border-primary ring-1 ring-primary",
                funil.archived && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <button className="min-w-0 text-left" onClick={() => setSelecionadoId(funil.id)}>
                  <p className="flex items-center gap-2 font-display text-lg font-semibold">
                    <span className="truncate">{funil.name}</span>
                    {funil.is_default && (
                      <Badge variant="secondary" className="shrink-0">
                        <Star className="mr-1 h-3 w-3 fill-current" /> Padrão
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{funil.slug ?? slugify(funil.name)}</p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={index === 0} onClick={() => moverFunil(funil, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === listaFunis.length - 1}
                    onClick={() => moverFunil(funil, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {funil.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{funil.description}</p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/60 p-2">
                  <p className="text-lg font-semibold">{r.abertos}</p>
                  <p className="text-[11px] text-muted-foreground">Abertos</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-2">
                  <p className="flex items-center justify-center gap-1 text-lg font-semibold">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {r.atrasados}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Atrasados</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-2">
                  <p className="text-sm font-semibold">{formatBRL(r.valor)}</p>
                  <p className="text-[11px] text-muted-foreground">Em aberto</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link to="/funil">
                    <KanbanSquare className="mr-1.5 h-3.5 w-3.5" /> Abrir
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => abrirEditarFunil(funil)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Renomear
                </Button>
                {!funil.is_default && !funil.archived && (
                  <Button size="sm" variant="outline" onClick={() => definirPadrao(funil)}>
                    <Star className="mr-1.5 h-3.5 w-3.5" /> Definir padrão
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => alternarArquivo(funil)}>
                  {funil.archived ? (
                    <>
                      <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" /> Reativar
                    </>
                  ) : (
                    <>
                      <Archive className="mr-1.5 h-3.5 w-3.5" /> Arquivar
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
        {listaFunis.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum funil cadastrado ainda.</p>
        )}
      </div>

      {selecionado && (
        <Panel
          title={`Etapas de ${selecionado.name}`}
          description="Defina a ordem, a etapa de fechamento, a de perda e como o assistente de IA identifica cada etapa."
          actions={
            <Button size="sm" onClick={abrirCriarEtapa}>
              <Plus className="mr-2 h-4 w-4" /> Nova etapa
            </Button>
          }
        >
          <div className="space-y-2">
            {etapasDoFunil.map((etapa, index) => (
              <div
                key={etapa.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3",
                  etapa.archived && "opacity-60",
                )}
              >
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: etapa.color ?? "#94a3b8" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{etapa.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Posição {index + 1}
                    {etapa.assistant_key ? ` · assistente: ${etapa.assistant_key}` : ""}
                  </p>
                </div>
                {etapa.stage_role !== "nenhum" && (
                  <Badge variant={etapa.stage_role === "fechamento" ? "default" : "destructive"}>
                    {PAPEL_LABEL[etapa.stage_role]}
                  </Badge>
                )}
                {etapa.archived && <Badge variant="secondary">Arquivada</Badge>}
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={index === 0} onClick={() => moverEtapa(etapa, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={index === etapasDoFunil.length - 1}
                    onClick={() => moverEtapa(etapa, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => abrirEditarEtapa(etapa)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => alternarArquivoEtapa(etapa)}>
                    {etapa.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
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
            {etapasDoFunil.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma etapa cadastrada.</p>
            )}
          </div>
        </Panel>
      )}

      <Dialog open={dialogFunil !== null} onOpenChange={(open) => !open && setDialogFunil(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogFunil?.modo === "criar" ? "Novo funil" : "Editar funil"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome do funil</Label>
              <Input value={nomeFunil} onChange={(e) => setNomeFunil(e.target.value)} maxLength={80} placeholder="Ex.: Funil de vendas" />
            </div>
            <div className="space-y-1.5">
              <Label>Apelido (endereço)</Label>
              <Input
                value={apelidoFunil}
                onChange={(e) => setApelidoFunil(e.target.value)}
                maxLength={60}
                placeholder={slugify(nomeFunil || "funil de vendas")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={descFunil} onChange={(e) => setDescFunil(e.target.value)} rows={3} maxLength={300} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogFunil(null)}>
              Cancelar
            </Button>
            <Button onClick={salvarFunil} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogEtapa !== null} onOpenChange={(open) => !open && setDialogEtapa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogEtapa?.modo === "criar" ? "Nova etapa" : "Editar etapa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome da etapa</Label>
              <Input value={nomeEtapa} onChange={(e) => setNomeEtapa(e.target.value)} maxLength={60} placeholder="Ex.: Proposta enviada" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <Input type="color" value={corEtapa} onChange={(e) => setCorEtapa(e.target.value)} className="h-9 w-full p-1" />
              </div>
              <div className="space-y-1.5">
                <Label>Papel da etapa</Label>
                <Select value={papelEtapa} onValueChange={(v) => setPapelEtapa(v as StageRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">{PAPEL_LABEL.nenhum}</SelectItem>
                    <SelectItem value="fechamento">{PAPEL_LABEL.fechamento}</SelectItem>
                    <SelectItem value="perda">{PAPEL_LABEL.perda}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Identificação para o assistente de IA</Label>
              <Input
                value={chaveAssistente}
                onChange={(e) => setChaveAssistente(e.target.value)}
                maxLength={60}
                placeholder="Ex.: proposta_enviada"
              />
              <p className="text-xs text-muted-foreground">
                Usada pelo assistente para mover negócios nesta etapa junto com a equipe.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEtapa(null)}>
              Cancelar
            </Button>
            <Button onClick={salvarEtapa} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={excluirEtapa !== null} onOpenChange={(open) => !open && setExcluirEtapa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir etapa "{excluirEtapa?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Negócios que estiverem nesta etapa precisam ser movidos antes. Essa ação não pode ser desfeita.
          </p>
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
