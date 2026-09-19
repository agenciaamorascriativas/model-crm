import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Globe2,
  MessageCircle,
  Search,
  Settings2,
  UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chatbot")({
  ssr: false,
  head: () => ({ meta: [
    { title: "ChatBot — Amoras CRM" },
    { name: "description", content: "Conversas iniciadas pelo chat do site aguardando a equipe." },
    { property: "og:title", content: "ChatBot — Amoras CRM" },
    { property: "og:description", content: "Conversas iniciadas pelo chat do site aguardando a equipe." },
  ] }),
  component: ChatBotPage,
});

type StatusConversa = "aguardando" | "em_atendimento" | "encerrada";

type SiteConversation = {
  id: number;
  name: string;
  preview: string;
  email: string;
  phone: string;
  page: string;
  unread: number;
  time: string;
  status: StatusConversa;
  esperaMinutos: number;
  responsavel: string | null;
  assunto: string;
  messages: { from: "visitor" | "bot" | "equipe"; body: string; time: string }[];
};

const STATUS_LABEL: Record<StatusConversa, string> = {
  aguardando: "Aguardando equipe",
  em_atendimento: "Em atendimento",
  encerrada: "Encerrada",
};

const STATUS_STYLE: Record<StatusConversa, string> = {
  aguardando: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  em_atendimento: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  encerrada: "bg-muted text-muted-foreground",
};

function espera(minutos: number) {
  if (minutos <= 0) return "—";
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `${horas} h ${minutos % 60} min`;
}

const CONVERSAS_INICIAIS: SiteConversation[] = [
  { id: 1, name: "Marina Costa", preview: "Quero falar com uma pessoa", email: "marina@empresa.com.br", phone: "+55 11 99999-5353", page: "/servicos", unread: 2, time: "10:42", status: "aguardando", esperaMinutos: 24, responsavel: null, assunto: "Planos e preços", messages: [
    { from: "bot", body: "Olá! Deixe sua mensagem que já chamamos uma pessoa do time.", time: "10:39" },
    { from: "visitor", body: "Quero entender melhor os planos e falar com uma pessoa.", time: "10:42" },
    { from: "bot", body: "Recebemos sua mensagem. Um atendente entra na conversa em instantes.", time: "10:42" },
  ] },
  { id: 2, name: "Lucas Almeida", preview: "Preciso de ajuda com meu pedido", email: "lucas@email.com", phone: "+55 21 98888-1842", page: "/contato", unread: 1, time: "09:18", status: "aguardando", esperaMinutos: 96, responsavel: null, assunto: "Suporte ao pedido", messages: [
    { from: "visitor", body: "Olá, preciso de ajuda com meu pedido.", time: "09:17" },
    { from: "bot", body: "Recebemos sua mensagem. Um atendente entra na conversa em instantes.", time: "09:18" },
  ] },
  { id: 3, name: "Beatriz Souza", preview: "Vocês atendem outras cidades?", email: "bia@exemplo.com", phone: "+55 31 97777-4200", page: "/", unread: 0, time: "Ontem", status: "em_atendimento", esperaMinutos: 4, responsavel: "Camila Duarte", assunto: "Área de atendimento", messages: [
    { from: "visitor", body: "Vocês atendem outras cidades?", time: "16:03" },
    { from: "bot", body: "Recebemos sua mensagem. Um atendente entra na conversa em instantes.", time: "16:03" },
    { from: "equipe", body: "Oi Beatriz, aqui é a Camila. Atendemos todo o estado, sim!", time: "16:08" },
  ] },
  { id: 4, name: "Visitante do site", preview: "Gostaria de receber uma proposta", email: "visitante@exemplo.com", phone: "Não informado", page: "/solucoes", unread: 1, time: "Ontem", status: "encerrada", esperaMinutos: 0, responsavel: "Bruno Alencar", assunto: "Proposta comercial", messages: [
    { from: "visitor", body: "Gostaria de receber uma proposta para minha empresa.", time: "14:21" },
    { from: "equipe", body: "Enviei a proposta para o seu e-mail. Qualquer dúvida, é só chamar!", time: "14:44" },
  ] },
];

function ChatBotPage() {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<SiteConversation[]>(CONVERSAS_INICIAIS);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = query
      ? conversations.filter((item) =>
          [item.name, item.email, item.preview, item.page, item.assunto].some((value) =>
            value.toLowerCase().includes(query),
          ),
        )
      : conversations;
    const ordem: Record<StatusConversa, number> = { aguardando: 0, em_atendimento: 1, encerrada: 2 };
    return [...base].sort((a, b) => ordem[a.status] - ordem[b.status] || b.esperaMinutos - a.esperaMinutos);
  }, [search, conversations]);

  const active = conversations.find((item) => item.id === activeId) ?? null;
  const aguardando = conversations.filter((c) => c.status === "aguardando").length;

  function assumir(id: number) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "em_atendimento", responsavel: "Você", unread: 0 } : c)),
    );
    toast.success("Conversa assumida. Você já pode responder ao visitante.");
  }

  function encerrar(id: number) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, status: "encerrada", esperaMinutos: 0 } : c)));
    toast.success("Conversa encerrada.");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-background md:min-h-screen">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b bg-card px-4 py-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold">ChatBot</h1>
            <Badge variant="secondary">dados de exemplo</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            O chat do site recebe a mensagem e avisa a equipe. {aguardando} conversa(s) aguardando atendimento.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/integracoes/chat-site"><Settings2 className="mr-2 h-4 w-4" />Configurar canal</Link>
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[21rem_minmax(0,1fr)]">
        <aside className={cn("min-h-0 border-r bg-card", active && "hidden md:block")}>
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar visitante, e-mail ou página..." className="pl-9" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-10.5rem)]">
            {filtered.map((conversation) => (
              <Button key={conversation.id} variant="ghost" onClick={() => setActiveId(conversation.id)} className={cn("h-auto w-full justify-start rounded-none border-b px-4 py-4 text-left", active?.id === conversation.id && "bg-accent")}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{conversation.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{conversation.time}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-normal text-foreground/80">{conversation.preview}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("font-normal", STATUS_STYLE[conversation.status])}>
                      {STATUS_LABEL[conversation.status]}
                    </Badge>
                    {conversation.status === "aguardando" && (
                      <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {espera(conversation.esperaMinutos)}
                      </span>
                    )}
                    {conversation.unread > 0 && (
                      <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5">{conversation.unread}</Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
            {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>}
          </ScrollArea>
        </aside>

        {active ? (
          <ConversationDetail
            conversation={active}
            onBack={() => setActiveId(null)}
            onAssumir={() => assumir(active.id)}
            onEncerrar={() => encerrar(active.id)}
          />
        ) : (
          <div className="hidden min-h-0 place-items-center md:grid">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="mx-auto mb-3 h-8 w-8" />
              <p className="text-sm">Selecione uma conversa do site</p>
            </div>
          </div>
        )}
      </div>

      {!active && (
        <div className="grid gap-3 border-t bg-card p-4 sm:grid-cols-3 md:ml-[21rem]">
          <Feature icon={UserRoundCheck} title="Atendimento humano" text="O chat recebe e avisa; a equipe entra ao vivo." />
          <Feature icon={BriefcaseBusiness} title="Virar oportunidade" text="O contato pode ser enviado para um funil." />
          <Feature icon={Globe2} title="Canal separado" text="Não mistura com as conversas do WhatsApp." />
        </div>
      )}
    </div>
  );
}

function ConversationDetail({
  conversation,
  onBack,
  onAssumir,
  onEncerrar,
}: {
  conversation: SiteConversation;
  onBack: () => void;
  onAssumir: () => void;
  onEncerrar: () => void;
}) {
  const assumida = conversation.status === "em_atendimento";
  return (
    <section className="flex min-h-[calc(100vh-10rem)] min-w-0 flex-col bg-muted/20 md:min-h-0">
      <div className="flex flex-wrap items-center gap-3 border-b bg-card px-4 py-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack} aria-label="Voltar às conversas"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground">{conversation.name[0]}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{conversation.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            <Badge variant="outline" className={cn("mr-2 font-normal", STATUS_STYLE[conversation.status])}>
              {STATUS_LABEL[conversation.status]}
            </Badge>
            {conversation.responsavel ? `com ${conversation.responsavel}` : `esperando há ${espera(conversation.esperaMinutos)}`}
          </p>
        </div>
        {conversation.status === "aguardando" && (
          <Button size="sm" onClick={onAssumir}><UserRoundCheck className="mr-2 h-4 w-4" />Assumir</Button>
        )}
        {assumida && (
          <Button size="sm" variant="outline" onClick={onEncerrar}><CheckCircle2 className="mr-2 h-4 w-4" />Encerrar</Button>
        )}
        <Button size="sm" variant="outline" onClick={() => toast.success("Oportunidade preparada para o funil.")}>
          <BriefcaseBusiness className="mr-2 h-4 w-4" />Virar oportunidade
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex min-h-0 min-w-0 flex-col">
          <ScrollArea className="flex-1 p-5">
            <div className="mx-auto max-w-2xl space-y-3">
              {conversation.messages.map((message, index) => (
                <div key={`${message.time}-${index}`} className={cn("flex", message.from === "visitor" ? "justify-start" : "justify-end")}>
                  <div className={cn("max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm", message.from === "visitor" ? "rounded-bl-md border bg-card" : message.from === "bot" ? "rounded-br-md border bg-muted" : "rounded-br-md bg-primary text-primary-foreground")}>
                    {message.from === "bot" && <p className="mb-1 text-[10px] uppercase tracking-wide opacity-70">mensagem automática</p>}
                    <p>{message.body}</p>
                    <p className={cn("mt-1 text-right text-[10px]", message.from === "equipe" ? "text-primary-foreground/70" : "text-muted-foreground")}>{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t bg-card px-4 py-3">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <Input
                disabled={!assumida}
                placeholder={assumida ? "Escreva sua resposta ao visitante..." : "Assuma a conversa para responder"}
              />
              <Button disabled={!assumida} onClick={() => toast.success("Resposta registrada (exemplo).")}>Enviar</Button>
            </div>
            <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground">
              O envio ao visitante é ativado quando o chat do site estiver instalado no servidor do cliente.
            </p>
          </div>
        </div>

        <aside className="hidden border-l bg-card p-4 lg:block">
          <p className="text-sm font-semibold">Dados coletados pelo chat</p>
          <dl className="mt-3 space-y-3 text-sm">
            <Dado rotulo="Nome" valor={conversation.name} />
            <Dado rotulo="E-mail" valor={conversation.email} />
            <Dado rotulo="WhatsApp" valor={conversation.phone} />
            <Dado rotulo="Assunto" valor={conversation.assunto} />
            <Dado rotulo="Página de origem" valor={conversation.page} />
            <Dado rotulo="Tempo de espera" valor={espera(conversation.esperaMinutos)} />
            <Dado rotulo="Responsável" valor={conversation.responsavel ?? "Ninguém ainda"} />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{rotulo}</dt>
      <dd className="truncate font-medium">{valor}</dd>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof UserRoundCheck; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
