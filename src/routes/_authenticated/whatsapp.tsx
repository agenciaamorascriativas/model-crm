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
import { Send, Plus, Loader2, Phone, Mail, Building2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Contact, Conversation, Message } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/whatsapp")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "WhatsApp — Amoras CRM" },
      { name: "description", content: "Converse com seus clientes e acompanhe as conversas." },
      { property: "og:title", content: "WhatsApp — Amoras CRM" },
      { property: "og:description", content: "Converse com seus clientes e acompanhe as conversas." },
    ],
  }),
  component: WhatsAppPage,
});

function WhatsAppPage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);

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

  // Atualização em tempo real da lista
  useEffect(() => {
    const channel = supabase
      .channel("conversations-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations ?? [];
    return (conversations ?? []).filter((c) => c.contacts?.name?.toLowerCase().includes(q));
  }, [conversations, search]);

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
          <ScrollArea className="flex-1">
            {isLoading && (
              <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma conversa ainda. Toque em <strong>Nova</strong> para começar.
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
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant={c.status === "aberta" ? "secondary" : "outline"} className="h-5 text-[11px]">
                    {c.status === "aberta" ? "Aberta" : "Fechada"}
                  </Badge>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat */}
        {active ? (
          <ChatPane
            key={active.id}
            conversation={active}
            onBackToList={() => setActiveId(null)}
          />
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
}: {
  conversation: Conversation;
  onBackToList: () => void;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
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
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        direction: "saida",
        body,
        author_id: userData.user?.id ?? null,
      });
      if (error) throw error;
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setText("");
    },
    onError: () => toast.error("Não foi possível enviar a mensagem."),
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b bg-card px-5 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          {conversation.contacts?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-semibold">{conversation.contacts?.name}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.contacts?.phone ?? "Sem telefone"}
          </p>
        </div>
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
                    m.direction === "saida" ? "text-primary-foreground/70" : "text-muted-foreground",
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
            {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
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
      const { data, error } = await supabase
        .from("conversations")
        .select("id, contact_id");
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
