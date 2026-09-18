import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trophy, XCircle, GripVertical, Trash2, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Contact, Lead, Pipeline, PipelineStage } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/funil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Funil de Vendas — Amoras CRM" },
      { name: "description", content: "Acompanhe seus negócios do primeiro contato ao fechamento." },
      { property: "og:title", content: "Funil de Vendas — Amoras CRM" },
      { property: "og:description", content: "Acompanhe seus negócios do primeiro contato ao fechamento." },
    ],
  }),
  component: FunilPage,
});

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const DIAS_PARADO = 7;

function diasParado(iso: string | null | undefined) {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function FunilPage() {
  const queryClient = useQueryClient();
  const [dragLead, setDragLead] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [soAtrasados, setSoAtrasados] = useState(false);
  const [funilId, setFunilId] = useState<string>("");

  const { data: pipelines } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("archived", false)
        .order("position");
      if (error) throw error;
      return data as unknown as Pipeline[];
    },
  });

  const funilAtivo = pipelines?.find((p) => p.id === funilId) ?? pipelines?.find((p) => p.is_default) ?? pipelines?.[0] ?? null;

  const { data: stages, isLoading: loadingStages } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_stages")
        .select("*")
        .order("position");
      if (error) throw error;
      return data as PipelineStage[];
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, contacts(name, company)")
        .order("position");
      if (error) throw error;
      return data as unknown as Lead[];
    },
  });

  const moveLead = useMutation({
    mutationFn: async ({ lead, stageId }: { lead: Lead; stageId: string }) => {
      if (lead.stage_id === stageId) return;
      const stage = stages?.find((s) => s.id === stageId);
      const { error } = await supabase
        .from("leads")
        .update({ stage_id: stageId })
        .eq("id", lead.id);
      if (error) throw error;
      await supabase.from("lead_events").insert({
        lead_id: lead.id,
        kind: "movimento",
        content: `Negócio movido para "${stage?.name ?? "novo estágio"}".`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: () => toast.error("Não foi possível mover o negócio."),
  });

  const etapasVisiveis = (stages ?? []).filter(
    (s) => !s.archived && (!funilAtivo || s.pipeline_id === funilAtivo.id),
  );
  const etapasIds = etapasVisiveis.map((s) => s.id);

  const doFunil = (leads ?? []).filter((l) => !l.stage_id || etapasIds.includes(l.stage_id));

  const q = busca.trim().toLowerCase();
  const visiveis = doFunil.filter((l) => {
    const combina =
      !q || [l.title, l.contacts?.name, l.contacts?.company].some((f) => f?.toLowerCase().includes(q));
    const atrasado = diasParado(l.updated_at) >= DIAS_PARADO;
    return combina && (!soAtrasados || atrasado);
  });

  const byStage = (stageId: string) => visiveis.filter((l) => l.stage_id === stageId && l.status === "aberto");

  const abertos = doFunil.filter((l) => l.status === "aberto");
  const atrasados = abertos.filter((l) => diasParado(l.updated_at) >= DIAS_PARADO);
  const wonTotal = doFunil.filter((l) => l.status === "ganho").reduce((sum, l) => sum + l.value_cents, 0);
  const openTotal = abertos.reduce((sum, l) => sum + l.value_cents, 0);

  if (loadingStages) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando funil...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 pb-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Funil de Vendas</h1>
          <p className="text-sm text-muted-foreground">
            {abertos.length} abertos · {atrasados.length} atrasados · Em negociação:{" "}
            <strong>{formatBRL(openTotal)}</strong> · Ganho:{" "}
            <strong className="text-primary">{formatBRL(wonTotal)}</strong>
          </p>
        </div>
        <Button onClick={() => { setCreatingIn(etapasVisiveis[0]?.id ?? null); setCreating(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo negócio
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar negócio, contato ou empresa..."
            className="pl-9"
          />
        </div>
        {(pipelines?.length ?? 0) > 1 && (
          <Select value={funilAtivo?.id ?? ""} onValueChange={setFunilId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Funil" /></SelectTrigger>
            <SelectContent>
              {(pipelines ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={soAtrasados} onCheckedChange={setSoAtrasados} />
          Somente atrasados
        </label>
      </div>


      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {etapasVisiveis.map((stage) => {
            const items = byStage(stage.id);
            const stageTotal = items.reduce((s, l) => s + l.value_cents, 0);
            return (
              <div
                key={stage.id}
                className="flex w-72 flex-col rounded-2xl border bg-muted/40"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragLead) moveLead.mutate({ lead: dragLead, stageId: stage.id });
                  setDragLead(null);
                }}
              >
                <div className="flex items-center gap-2 px-4 py-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color ?? "#94a3b8" }}
                  />
                  <span className="text-sm font-semibold">{stage.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="px-2 pb-1 text-xs text-muted-foreground">{formatBRL(stageTotal)}</div>
                <ScrollArea className="max-h-[60vh] px-2 pb-3">
                  <div className="space-y-2">
                    {items.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => setDragLead(lead)}
                        className="group cursor-grab rounded-xl border bg-card p-3 shadow-sm active:cursor-grabbing"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-snug">{lead.title}</p>
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                        </div>
                        {lead.contacts?.name && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{lead.contacts.name}</p>
                        )}
                        {lead.value_cents > 0 && (
                          <p className="mt-1.5 text-sm font-medium text-primary">
                            {formatBRL(lead.value_cents)}
                          </p>
                        )}
                        {diasParado(lead.updated_at) >= DIAS_PARADO && (
                          <Badge variant="destructive" className="mt-1.5">
                            <Clock className="mr-1 h-3 w-3" />
                            {diasParado(lead.updated_at)} dias sem movimento
                          </Badge>
                        )}
                        <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-emerald-700"
                            onClick={async () => {
                              await supabase.from("leads").update({ status: "ganho" }).eq("id", lead.id);
                              queryClient.invalidateQueries({ queryKey: ["leads"] });
                            }}
                          >
                            <Trophy className="mr-1 h-3 w-3" /> Ganho
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-700"
                            onClick={async () => {
                              await supabase.from("leads").update({ status: "perdido" }).eq("id", lead.id);
                              queryClient.invalidateQueries({ queryKey: ["leads"] });
                            }}
                          >
                            <XCircle className="mr-1 h-3 w-3" /> Perdido
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-auto h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={async () => {
                              await supabase.from("leads").delete().eq("id", lead.id);
                              queryClient.invalidateQueries({ queryKey: ["leads"] });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setCreatingIn(stage.id);
                        setCreating(true);
                      }}
                      className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" /> Negócio aqui
                    </button>
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <NewLeadDialog
        open={creating}
        stageId={creatingIn}
        stages={stages ?? []}
        onClose={() => setCreating(false)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["leads"] })}
      />
    </div>
  );
}

function NewLeadDialog({
  open,
  stageId,
  stages,
  onClose,
  onSaved,
}: {
  open: boolean;
  stageId: string | null;
  stages: PipelineStage[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("id, name").order("name");
      if (error) throw error;
      return data as Pick<Contact, "id" | "name">[];
    },
    enabled: open,
  });

  const [loadedOpen, setLoadedOpen] = useState(false);
  if (open && !loadedOpen) {
    setLoadedOpen(true);
    setTitle("");
    setContactId("");
    setValue("");
    setNotes("");
  }
  if (!open && loadedOpen) setLoadedOpen(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      title,
      contact_id: contactId || null,
      stage_id: stageId,
      value_cents: Math.round(parseFloat(value.replace(",", ".") || "0") * 100),
      notes: notes || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível criar o negócio.");
    } else {
      toast.success("Negócio criado.");
      onSaved();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo negócio</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Sistema para Padaria da Praça"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Contato</Label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Nenhum</option>
                {(contacts ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="1500,00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
