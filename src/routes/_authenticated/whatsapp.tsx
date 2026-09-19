import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Plus,
  Loader2,
  Search,
  MoreVertical,
  UserCheck,
  Users,
  Clock,
  RotateCcw,
  ClipboardList,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Contact, Conversation, Demanda, Message } from "@/lib/types";
import { sendWhatsappMessage } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/_authenticated/whatsapp")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "WhatsApp — Amoras CRM" },
      { name: "description", content: "Converse com seus clientes e acompanhe as conversas." },
      { property: "og:title", content: "WhatsApp — Amoras CRM" },
      {
        property: "og:description",
        content: "Converse com seus clientes e acompanhe as conversas.",
      },
    ],
  }),
  component: WhatsAppPage,
});

type TeamProfile = { user_id: string; full_name: string | null; email: string | null };

function isSnoozed(c: Conversation) {
  return !!c.snoozed_until && new Date(c.snoozed_until).getTime() > Date.now();
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nameFor(profiles: TeamProfile[] | undefined, userId: string | null) {
  if (!userId) return null;
  const p = profiles?.find((p) => p.user_id === userId);
  return p?.full_name || p?.email?.split("@")[0] || "Atendente";
}

const SNOOZE_OPTIONS: { label: string; getDate: () => Date }[] = [
  { label: "1 hora", getDate: () => new Date(Date.now() + 60 * 60 * 1000) },
  { label: "3 horas", getDate: () => new Date(Date.now() + 3 * 60 * 60 * 1000) },
  {
    label: "Amanhã às 9h",
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

const TABS: { key: "abertas" | "minhas" | "adiadas" | "fechadas"; label: string }[] = [
  { key: "abertas", label: "Abertas" },
  { key: "minhas", label: "Minhas" },
  { key: "adiadas", label: "Adiadas" },
  { key: "fechadas", label: "Fechadas" },
];

function WhatsAppPage() {
  const queryClient = useQueryClient();
  const meId = Route.useRouteContext().user.id;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("abertas");
  const [, setTick] = useState(0);

  // Reavalia conversas adiadas periodicamente, sem depender de uma mudança no banco
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, contacts(name, phone, email, company, tags)")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Conversation[];
    },
  });

  const { data: teamProfiles } = useQuery({
    queryKey: ["team-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data as TeamProfile[];
    },
  });

  // Atualização em tempo real da lista
  useEffect(() => {
    const channel = supabase
      .channel("conversations-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () =>
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (conversations ?? []).filter((c) => {
      const snoozed = isSnoozed(c);
      if (tab === "abertas" && (c.status !== "aberta" || snoozed)) return false;
      if (tab === "minhas" && (c.status !== "aberta" || snoozed || c.assignee !== meId))
        return false;
      if (tab === "adiadas" && !snoozed) return false;
      if (tab === "fechadas" && c.status !== "fechada") return false;
      if (q && !c.contacts?.name?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [conversations, search, tab, meId]);

  const active = filtered.find((c) => c.id === activeId) ?? filtered[0] ?? null;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Lista de conversas */}
        <div className="flex w-80 flex-col border-r bg-card">
          <div className="flex items-center justify-between gap-2 p-4">
            <h1 className="font-display text-lg font-bold">Conversas</h1>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nova
            </Button>
          </div>
          <div className="relative mx-3 mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 px-3 pb-3">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ScrollArea className="flex-1">
            {isLoading && (
              <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma conversa aqui. Toque em <strong>Nova</strong> para começar.
              </p>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "block w-full border-b px-4 py-3 text-left transition-colors",
                  active?.id === c.id ? "bg-accent" : "hover:bg-muted/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{c.contacts?.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(c.last_message_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant={c.status === "aberta" ? "secondary" : "outline"}
                    className="h-5 text-[11px]"
                  >
                    {c.status === "aberta" ? "Aberta" : "Fechada"}
                  </Badge>
                  {isSnoozed(c) ? (
                    <Badge variant="outline" className="h-5 gap-1 text-[11px]">
                      <Clock className="h-3 w-3" /> até {formatShort(c.snoozed_until!)}
                    </Badge>
                  ) : (
                    <span className="truncate text-[11px] text-muted-foreground">
                      {nameFor(teamProfiles, c.assignee) ?? "Sem atendente"}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat */}
        {active ? (
          <ChatPane key={active.id} conversation={active} meId={meId} teamProfiles={teamProfiles} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Selecione uma conversa
          </div>
        )}
      </div>

      <NewConversationDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(id) => {
          setNewOpen(false);
          setActiveId(id);
        }}
      />
    </div>
  );
}

function ChatPane({
  conversation,
  meId,
  teamProfiles,
}: {
  conversation: Conversation;
  meId: string;
  teamProfiles: TeamProfile[] | undefined;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [demandaOpen, setDemandaOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["messages", conversation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  const { data: demandaLink } = useQuery({
    queryKey: ["demanda-conversa", conversation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demanda_conversas")
        .select("demanda_id, demandas(id, title, status, contact_id)")
        .eq("conversation_id", conversation.id)
        .maybeSingle();
      if (error) throw error;
      return data as { demanda_id: string; demandas: Demanda } | null;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages-live-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const send = useMutation({
    mutationFn: async (body: string) => {
      await sendWhatsappMessage({ data: { conversationId: conversation.id, body } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setText("");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar a mensagem."),
  });

  const claim = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("conversations")
        .update({ assignee: meId, snoozed_until: null })
        .eq("id", conversation.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Você assumiu esta conversa.");
    },
    onError: () => toast.error("Não foi possível assumir a conversa."),
  });

  const transfer = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("conversations")
        .update({ assignee: userId, snoozed_until: null })
        .eq("id", conversation.id);
      if (error) throw error;
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success(`Conversa transferida para ${nameFor(teamProfiles, userId)}.`);
    },
    onError: () => toast.error("Não foi possível transferir a conversa."),
  });

  const snooze = useMutation({
    mutationFn: async (date: Date) => {
      const { error } = await supabase
        .from("conversations")
        .update({ snoozed_until: date.toISOString() })
        .eq("id", conversation.id);
      if (error) throw error;
      return date;
    },
    onSuccess: (date) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success(`Conversa adiada até ${formatShort(date.toISOString())}.`);
    },
    onError: () => toast.error("Não foi possível adiar a conversa."),
  });

  const unsnooze = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("conversations")
        .update({ snoozed_until: null })
        .eq("id", conversation.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Adiamento removido.");
    },
    onError: () => toast.error("Não foi possível remover o adiamento."),
  });

  const snoozed = isSnoozed(conversation);
  const assigneeName = nameFor(teamProfiles, conversation.assignee);
  const outros = (teamProfiles ?? []).filter((p) => p.user_id !== conversation.assignee);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b bg-card px-5 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          {conversation.contacts?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{conversation.contacts?.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.contacts?.phone ?? "Sem telefone"} ·{" "}
            {assigneeName ? `Com ${assigneeName}` : "Sem atendente"}
            {snoozed && ` · Adiada até ${formatShort(conversation.snoozed_until!)}`}
          </p>
        </div>

        <Button
          size="sm"
          variant={demandaLink ? "secondary" : "outline"}
          className="h-8 gap-1.5 text-xs"
          onClick={() => setDemandaOpen(true)}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          {demandaLink ? demandaLink.demandas.title : "Demanda"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Ações da conversa">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              disabled={conversation.assignee === meId}
              onClick={() => claim.mutate()}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Assumir para mim
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Users className="mr-2 h-4 w-4" /> Transferir para...
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {outros.length === 0 && (
                  <DropdownMenuLabel className="font-normal text-muted-foreground">
                    Ninguém mais na equipe
                  </DropdownMenuLabel>
                )}
                {outros.map((p) => (
                  <DropdownMenuItem key={p.user_id} onClick={() => transfer.mutate(p.user_id)}>
                    {p.full_name || p.email}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            {snoozed ? (
              <DropdownMenuItem onClick={() => unsnooze.mutate()}>
                <RotateCcw className="mr-2 h-4 w-4" /> Remover adiamento
              </DropdownMenuItem>
            ) : (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Clock className="mr-2 h-4 w-4" /> Adiar...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {SNOOZE_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt.label} onClick={() => snooze.mutate(opt.getDate())}>
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 p-5">
        <div className="mx-auto max-w-2xl space-y-2">
          {messages?.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Envie a primeira!
            </p>
          )}
          {messages?.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.direction === "saida" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                  m.direction === "saida"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted",
                )}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p
                  className={cn(
                    "mt-1 text-right text-[10px]",
                    m.direction === "saida"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (text.trim()) send.mutate(text.trim());
              }
            }}
            placeholder="Escreva uma mensagem... (Enter para enviar)"
            rows={1}
            className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="icon"
            className="h-[42px] w-[42px] rounded-xl"
            disabled={!text.trim() || send.isPending}
            onClick={() => text.trim() && send.mutate(text.trim())}
          >
            {send.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <DemandaDialog
        open={demandaOpen}
        onClose={() => setDemandaOpen(false)}
        conversationId={conversation.id}
        contactId={conversation.contact_id}
        contactName={conversation.contacts?.name ?? "este contato"}
        linked={demandaLink?.demandas ?? null}
      />
    </div>
  );
}

function DemandaDialog({
  open,
  onClose,
  conversationId,
  contactId,
  contactName,
  linked,
}: {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  contactId: string;
  contactName: string;
  linked: Demanda | null;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const { data: openDemandas } = useQuery({
    queryKey: ["demandas-contato", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demandas")
        .select("*")
        .eq("contact_id", contactId)
        .eq("status", "aberta")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Demanda[];
    },
    enabled: open,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["demanda-conversa", conversationId] });
    queryClient.invalidateQueries({ queryKey: ["demandas-contato", contactId] });
  }

  const criarEVincular = useMutation({
    mutationFn: async () => {
      const { data: demanda, error } = await supabase
        .from("demandas")
        .insert({ contact_id: contactId, title: title.trim() })
        .select("id")
        .single();
      if (error || !demanda) throw error;
      const { error: linkError } = await supabase
        .from("demanda_conversas")
        .insert({ demanda_id: demanda.id, conversation_id: conversationId });
      if (linkError) throw linkError;
    },
    onSuccess: () => {
      toast.success("Demanda criada e vinculada a esta conversa.");
      setTitle("");
      invalidate();
      onClose();
    },
    onError: () => toast.error("Não foi possível criar a demanda."),
  });

  const vincular = useMutation({
    mutationFn: async (demandaId: string) => {
      const { error } = await supabase
        .from("demanda_conversas")
        .insert({ demanda_id: demandaId, conversation_id: conversationId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Conversa vinculada à demanda.");
      invalidate();
      onClose();
    },
    onError: () => toast.error("Não foi possível vincular à demanda."),
  });

  const desvincular = useMutation({
    mutationFn: async (demandaId: string) => {
      const { error } = await supabase
        .from("demanda_conversas")
        .delete()
        .eq("demanda_id", demandaId)
        .eq("conversation_id", conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Conversa desvinculada da demanda.");
      invalidate();
    },
    onError: () => toast.error("Não foi possível desvincular."),
  });

  const encerrar = useMutation({
    mutationFn: async (demandaId: string) => {
      const { error } = await supabase
        .from("demandas")
        .update({ status: "resolvida", closed_at: new Date().toISOString() })
        .eq("id", demandaId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Demanda encerrada.");
      invalidate();
      onClose();
    },
    onError: () => toast.error("Não foi possível encerrar a demanda."),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Demanda de {contactName}</DialogTitle>
        </DialogHeader>

        {linked ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Esta conversa está vinculada à demanda:</p>
            <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3">
              <div>
                <p className="text-sm font-medium">{linked.title}</p>
                <Badge variant="secondary" className="mt-1 h-5 text-[11px]">
                  {linked.status === "aberta"
                    ? "Aberta"
                    : linked.status === "resolvida"
                      ? "Resolvida"
                      : "Cancelada"}
                </Badge>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => desvincular.mutate(linked.id)}
                aria-label="Desvincular"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            {linked.status === "aberta" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => encerrar.mutate(linked.id)}
                disabled={encerrar.isPending}
              >
                Encerrar demanda
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(openDemandas ?? []).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Vincular a uma demanda aberta</p>
                <div className="space-y-1.5">
                  {(openDemandas ?? []).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => vincular.mutate(d.id)}
                      className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      {d.title}
                      <span className="text-xs text-muted-foreground">Vincular</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Nova demanda</p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Cobrança da nota fiscal"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button
                disabled={!title.trim() || criarEVincular.isPending}
                onClick={() => criarEVincular.mutate()}
              >
                {criarEVincular.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar e vincular
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NewConversationDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}) {
  const [contactId, setContactId] = useState("");

  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, phone")
        .order("name");
      if (error) throw error;
      return data as Pick<Contact, "id" | "name" | "phone">[];
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("conversations").select("id, contact_id");
      if (error) throw error;
      return data as { id: string; contact_id: string }[];
    },
    enabled: open,
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!contactId) return;
    const already = existing?.find((c) => c.contact_id === contactId);
    if (already) {
      onCreated(already.id);
      setContactId("");
      return;
    }
    const { data, error } = await supabase
      .from("conversations")
      .insert({ contact_id: contactId })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Não foi possível criar a conversa.");
      return;
    }
    setContactId("");
    onCreated(data.id);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
        </DialogHeader>
        <form onSubmit={create} className="space-y-4">
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            required
          >
            <option value="">Escolha um contato...</option>
            {(contacts ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `· ${c.phone}` : ""}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!contactId}>
              Abrir conversa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
