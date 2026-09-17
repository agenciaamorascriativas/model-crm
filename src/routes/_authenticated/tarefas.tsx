import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Profile, Task } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/tarefas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tarefas — Amoras CRM" },
      { name: "description", content: "Organize as tarefas da equipe com prazos e responsáveis." },
      { property: "og:title", content: "Tarefas — Amoras CRM" },
      { property: "og:description", content: "Organize as tarefas da equipe com prazos e responsáveis." },
    ],
  }),
  component: TarefasPage,
});

function TarefasPage() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("done").order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name");
      if (error) throw error;
      return data as Pick<Profile, "user_id" | "full_name">[];
    },
  });

  const nameOf = (userId: string | null) =>
    profiles?.find((p) => p.user_id === userId)?.full_name ?? null;

  const toggle = useMutation({
    mutationFn: async (t: Task) => {
      const { error } = await supabase.from("tasks").update({ done: !t.done }).eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    onError: () => toast.error("Não foi possível atualizar a tarefa."),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const open = (tasks ?? []).filter((t) => !t.done);
  const done = (tasks ?? []).filter((t) => t.done);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            {open.length} em aberto · {done.length} concluídas
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        {isLoading && (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && open.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma tarefa em aberto. Bom trabalho!
          </p>
        )}
        <ul className="divide-y">
          {open.map((t) => (
            <li key={t.id} className="group flex items-center gap-3 px-5 py-3.5">
              <Checkbox checked={false} onCheckedChange={() => toggle.mutate(t)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                {t.description && (
                  <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {t.due_date && (
                  <span
                    className={cn(
                      "text-xs",
                      overdue(t.due_date) ? "font-medium text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {new Date(t.due_date + "T12:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                )}
                {t.assignee && (
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {nameOf(t.assignee)}
                  </span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  onClick={async () => {
                    await supabase.from("tasks").delete().eq("id", t.id);
                    invalidate();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {done.length > 0 && (
          <div className="border-t px-5 py-3">
            <button
              onClick={() => setShowDone(!showDone)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {showDone ? "Ocultar" : "Mostrar"} concluídas ({done.length})
            </button>
          </div>
        )}
        {showDone && done.length > 0 && (
          <ul className="divide-y border-t">
            {done.map((t) => (
              <li key={t.id} className="group flex items-center gap-3 px-5 py-3">
                <Checkbox checked onCheckedChange={() => toggle.mutate(t)} />
                <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground line-through">
                  {t.title}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  onClick={async () => {
                    await supabase.from("tasks").delete().eq("id", t.id);
                    invalidate();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewTaskDialog
        open={creating}
        profiles={profiles ?? []}
        onClose={() => setCreating(false)}
        onSaved={invalidate}
      />
    </div>
  );
}

function overdue(due: string) {
  const d = new Date(due + "T23:59:59");
  return d < new Date();
}

function NewTaskDialog({
  open,
  profiles,
  onClose,
  onSaved,
}: {
  open: boolean;
  profiles: Pick<Profile, "user_id" | "full_name">[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [saving, setSaving] = useState(false);

  const [loadedOpen, setLoadedOpen] = useState(false);
  if (open && !loadedOpen) {
    setLoadedOpen(true);
    setTitle("");
    setDescription("");
    setDueDate("");
    setAssignee("");
  }
  if (!open && loadedOpen) setLoadedOpen(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("tasks").insert({
      title,
      description: description || null,
      due_date: dueDate || null,
      assignee: assignee || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível criar a tarefa.");
    } else {
      toast.success("Tarefa criada.");
      onSaved();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Ligar para o cliente"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prazo</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Ninguém</option>
                {profiles.map((p) => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.full_name ?? p.user_id}
                  </option>
                ))}
              </select>
            </div>
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
