import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Appointment, Contact } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/agenda")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Agenda — Amoras CRM" },
      { name: "description", content: "Compromissos e reuniões da equipe." },
      { property: "og:title", content: "Agenda — Amoras CRM" },
      { property: "og:description", content: "Compromissos e reuniões da equipe." },
    ],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [creating, setCreating] = useState(false);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, contacts(name)")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data as unknown as Appointment[];
    },
  });

  const dayAppointments = (appointments ?? []).filter((a) => sameDay(new Date(a.starts_at), selectedDay));

  const upcoming = (appointments ?? [])
    .filter((a) => new Date(a.starts_at) >= new Date() && !sameDay(new Date(a.starts_at), selectedDay))
    .slice(0, 6);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["appointments"] });

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Agenda</h1>
          <p className="text-sm text-muted-foreground">Compromissos e reuniões da equipe</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo compromisso
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={(d) => d && setSelectedDay(d)}
              className="mx-auto"
              modifiers={{
                hasEvents: (appointments ?? []).map((a) => new Date(a.starts_at)),
              }}
              modifiersClassNames={{ hasEvents: "font-bold text-primary underline" }}
            />
          </div>
          {upcoming.length > 0 && (
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <h3 className="mb-3 font-display text-sm font-semibold">Próximos compromissos</h3>
              <ul className="space-y-2.5">
                {upcoming.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.starts_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-display font-semibold">
              {selectedDay.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
          </div>
          <div className="p-5">
            {isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />}
            {!isLoading && dayAppointments.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhum compromisso neste dia.
              </p>
            )}
            <div className="space-y-3">
              {dayAppointments.map((a) => (
                <div
                  key={a.id}
                  className="group flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="w-20 shrink-0 text-center">
                    <p className="text-sm font-semibold">
                      {new Date(a.starts_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.ends_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.title}</p>
                    {a.contacts?.name && <Badge variant="secondary">{a.contacts.name}</Badge>}
                    {a.notes && <p className="mt-1 text-xs text-muted-foreground">{a.notes}</p>}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                    onClick={async () => {
                      await supabase.from("appointments").delete().eq("id", a.id);
                      toast.success("Compromisso removido.");
                      invalidate();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NewAppointmentDialog
        open={creating}
        initialDate={selectedDay}
        onClose={() => setCreating(false)}
        onSaved={invalidate}
      />
    </div>
  );
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function NewAppointmentDialog({
  open,
  initialDate,
  onClose,
  onSaved,
}: {
  open: boolean;
  initialDate: Date;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [contactId, setContactId] = useState("");
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
    const iso = toISODate(initialDate);
    setDate(iso);
    setTitle("");
    setStart("09:00");
    setEnd("10:00");
    setContactId("");
    setNotes("");
  }
  if (!open && loadedOpen) setLoadedOpen(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const starts_at = new Date(`${date}T${start}:00`);
    const ends_at = new Date(`${date}T${end}:00`);
    const { error } = await supabase.from("appointments").insert({
      title,
      starts_at: starts_at.toISOString(),
      ends_at: ends_at.toISOString(),
      contact_id: contactId || null,
      notes: notes || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível criar o compromisso.");
    } else {
      toast.success("Compromisso criado.");
      onSaved();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo compromisso</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Reunião com cliente"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Contato</Label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className={cn("w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring")}
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
            <Label>Notas</Label>
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

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
