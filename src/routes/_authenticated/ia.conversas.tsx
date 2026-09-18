import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, EmptyState } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, Pause, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CONVERSAS_IA, type ConversaIA } from "@/lib/demo/ia-operacao";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ia/conversas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conversas da IA — Amoras CRM" },
      { name: "description", content: "Caixa de entrada das conversas atendidas pela inteligência artificial." },
      { property: "og:title", content: "Conversas da IA — Amoras CRM" },
      { property: "og:description", content: "Caixa de entrada das conversas atendidas pela inteligência artificial." },
    ],
  }),
  component: ConversasIAPage,
});

function ConversasIAPage() {
  const [conversas, setConversas] = useState<ConversaIA[]>(CONVERSAS_IA);
  const [ativaId, setAtivaId] = useState<string | null>(CONVERSAS_IA[0]?.id ?? null);
  const ativa = conversas.find((c) => c.id === ativaId) ?? null;

  function assumirConversa(id: string) {
    setConversas((atual) => atual.map((c) => (c.id === id ? { ...c, iaAtiva: false } : c)));
    toast.success("Você assumiu a conversa.");
  }

  function pausarIA(id: string) {
    setConversas((atual) => atual.map((c) => (c.id === id ? { ...c, iaAtiva: false } : c)));
    toast.success("IA pausada nesta conversa.");
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Conversas da IA"
        description="Conversas atendidas pela inteligência artificial, com o que foi entendido em cada uma."
        demo
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr_280px]">
        <div className="rounded-2xl border bg-card shadow-sm">
          <ScrollArea className="h-[560px]">
            <div className="space-y-1 p-2">
              {conversas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAtivaId(c.id)}
                  className={cn(
                    "w-full rounded-xl p-3 text-left transition hover:bg-accent",
                    ativaId === c.id && "bg-accent",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{c.contato}</p>
                    {c.iaAtiva ? (
                      <Badge variant="secondary" className="gap-1">
                        <Bot className="h-3 w-3" /> IA
                      </Badge>
                    ) : (
                      <Badge variant="outline">Humano</Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{c.ultimaMensagem}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{c.hora}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col rounded-2xl border bg-card shadow-sm">
          {ativa ? (
            <>
              <header className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="font-display font-semibold">{ativa.contato}</p>
                  <p className="text-xs text-muted-foreground">
                    {ativa.iaAtiva ? "Atendido pela IA" : "Assumido por humano"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => pausarIA(ativa.id)} disabled={!ativa.iaAtiva}>
                    <Pause className="mr-2 h-4 w-4" /> Pausar IA
                  </Button>
                  <Button size="sm" onClick={() => assumirConversa(ativa.id)} disabled={!ativa.iaAtiva}>
                    <UserCheck className="mr-2 h-4 w-4" /> Assumir conversa
                  </Button>
                </div>
              </header>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {ativa.mensagens.map((m, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                        m.autor === "cliente" && "bg-muted",
                        m.autor === "ia" && "ml-auto bg-primary text-primary-foreground",
                        m.autor === "humano" && "ml-auto bg-accent",
                      )}
                    >
                      <p>{m.texto}</p>
                      <p className="mt-1 text-[10px] opacity-70">{m.hora}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <EmptyState title="Selecione uma conversa" />
          )}
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          {ativa ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold">O que a IA entendeu</h3>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Intenção</p>
                <p className="text-sm font-medium">{ativa.intencao}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Dados coletados</p>
                <div className="space-y-1.5">
                  {ativa.dadosColetados.map((d, idx) => (
                    <div key={idx} className="rounded-lg border px-2 py-1.5 text-xs">
                      <p className="text-muted-foreground">{d.rotulo}</p>
                      <p className="font-medium">{d.valor}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Próxima ação</p>
                <p className="text-sm">{ativa.proximaAcao}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Selecione uma conversa para ver os detalhes.</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
