import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Info, Send, Signal, Gauge, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EVENTOS_CANAL } from "@/lib/demo/atendimento";

export const Route = createFileRoute("/_authenticated/canal-oficial")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Canal oficial — Amoras CRM" },
      { name: "description", content: "Configuração do canal oficial de WhatsApp." },
      { property: "og:title", content: "Canal oficial — Amoras CRM" },
      { property: "og:description", content: "Configuração do canal oficial de WhatsApp." },
    ],
  }),
  component: CanalOficialPage,
});

const EVENTO_ICON = {
  info: Info,
  sucesso: CheckCircle2,
  alerta: AlertTriangle,
};

const EVENTO_STYLE = {
  info: "text-primary",
  sucesso: "text-emerald-600 dark:text-emerald-400",
  alerta: "text-amber-600 dark:text-amber-400",
};

function CanalOficialPage() {
  const [numeroId, setNumeroId] = useState("");
  const [contaId, setContaId] = useState("");
  const [token, setToken] = useState("");
  const webhookUrl = "https://amorascrm.app/api/webhooks/whatsapp";
  const [numeroTeste, setNumeroTeste] = useState("");
  const [mensagemTeste, setMensagemTeste] = useState("");

  function copiarWebhook() {
    navigator.clipboard?.writeText(webhookUrl);
    toast.success("URL do webhook copiada");
  }

  function enviarTeste() {
    if (!numeroTeste || !mensagemTeste) {
      toast.error("Informe o número e a mensagem de teste.");
      return;
    }
    toast.success(`Mensagem de teste enviada para ${numeroTeste} (simulação)`);
    setMensagemTeste("");
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Canal oficial"
        description="Status e configuração da conexão oficial de WhatsApp"
        demo
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Panel title="Status da conexão">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Número conectado</p>
                <p className="mt-1 font-display text-lg font-semibold">+55 11 4002-8922</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nome exibido</p>
                <p className="mt-1 font-display text-lg font-semibold">Amoras Store</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Qualidade do número</p>
                <Badge variant="outline" className="mt-1 border-emerald-500/20 bg-emerald-500/10 font-normal text-emerald-600 dark:text-emerald-400">
                  <Signal className="mr-1 h-3 w-3" /> Alta
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Limite de envio diário</p>
                <div className="mt-1 flex items-center gap-1.5 font-display text-lg font-semibold">
                  <Gauge className="h-4 w-4 text-muted-foreground" /> 10.000 conversas
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Credenciais da API" description="Preencha os dados fornecidos pelo provedor oficial">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>A conexão real será ativada em breve</AlertTitle>
              <AlertDescription>
                Estes campos estão prontos para você preencher. A integração com o WhatsApp oficial será ligada em uma etapa futura.
              </AlertDescription>
            </Alert>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>ID do número de telefone</Label>
                <Input
                  placeholder="Ex.: 109876543210"
                  value={numeroId}
                  onChange={(e) => setNumeroId(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>ID da conta comercial</Label>
                <Input
                  placeholder="Ex.: 987654321098"
                  value={contaId}
                  onChange={(e) => setContaId(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Token de acesso</Label>
                <Input
                  type="password"
                  placeholder="Cole aqui o token de acesso"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>URL do webhook</Label>
                <div className="flex gap-2">
                  <Input readOnly value={webhookUrl} className="font-mono text-sm" />
                  <Button type="button" variant="outline" onClick={copiarWebhook}>
                    <Copy className="mr-2 h-4 w-4" /> Copiar
                  </Button>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <Button disabled className="w-full sm:w-auto">
              Salvar credenciais (em breve)
            </Button>
          </Panel>

          <Panel title="Teste de envio" description="Envie uma mensagem de teste para validar o canal">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Número de destino</Label>
                <Input
                  placeholder="(11) 99999-0000"
                  value={numeroTeste}
                  onChange={(e) => setNumeroTeste(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Mensagem</Label>
                <Textarea
                  rows={3}
                  placeholder="Digite a mensagem de teste"
                  value={mensagemTeste}
                  onChange={(e) => setMensagemTeste(e.target.value)}
                />
              </div>
            </div>
            <Button className="mt-4" onClick={enviarTeste}>
              <Send className="mr-2 h-4 w-4" /> Enviar teste
            </Button>
          </Panel>
        </div>

        <Panel title="Histórico de eventos" description="Últimas atualizações do canal">
          <div className="space-y-4">
            {EVENTOS_CANAL.map((evento) => {
              const Icon = EVENTO_ICON[evento.tipo];
              return (
                <div key={evento.id} className="flex gap-3">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", EVENTO_STYLE[evento.tipo])} />
                  <div>
                    <p className="text-sm font-medium">{evento.titulo}</p>
                    <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{evento.data}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}
