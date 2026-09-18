import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/configuracoes/whatsapp")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "WhatsApp — Amoras CRM" },
      { name: "description", content: "Conexão do WhatsApp usado no atendimento." },
      { property: "og:title", content: "WhatsApp — Amoras CRM" },
      { property: "og:description", content: "Conexão do WhatsApp usado no atendimento." },
    ],
  }),
  component: WhatsappConfigPage,
});

const webhookUrl = "https://api.amoras.crm/webhooks/whatsapp/1a2b3c";

function WhatsappConfigPage() {
  const [modo, setModo] = useState<"gateway" | "oficial">("gateway");
  const [endereco, setEndereco] = useState("https://gateway.clienteexemplo.com.br");
  const [chave, setChave] = useState("");
  const [numero, setNumero] = useState("(11) 99999-9999");
  const [testando, setTestando] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp" description="Escolha e configure a conexão do atendimento." demo />

      <Panel title="Modo de conexão">
        <div className="grid gap-3 sm:grid-cols-2">
          {(["gateway", "oficial"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                modo === m ? "border-primary bg-secondary/40" : "hover:bg-muted",
              )}
            >
              <p className="font-medium">
                {m === "gateway" ? "Gateway próprio" : "Canal oficial"}
              </p>
              <p className="text-sm text-muted-foreground">
                {m === "gateway"
                  ? "Conecta a um gateway instalado no servidor do cliente."
                  : "Conecta pela API oficial de mensagens do WhatsApp."}
              </p>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Dados de conexão">
        <div className="grid gap-4 sm:grid-cols-2">
          {modo === "gateway" && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Endereço do gateway</Label>
              <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Chave de acesso</Label>
            <Input
              type="password"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Número do WhatsApp</Label>
            <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
          </div>
        </div>
      </Panel>

      <Panel title="Webhook">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={webhookUrl} readOnly className="max-w-md" />
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(webhookUrl);
              toast.success("Webhook copiado.");
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copiar
          </Button>
        </div>
      </Panel>

      <Panel title="Estado da conexão">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <Badge className="gap-1" variant="secondary">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Conectado
            </Badge>
            <span className="text-sm text-muted-foreground">Última verificação: agora</span>
          </div>
          <Button
            variant="outline"
            disabled={testando}
            onClick={() => {
              setTestando(true);
              setTimeout(() => {
                setTestando(false);
                toast.success("Conexão testada com sucesso (exemplo).");
              }, 900);
            }}
          >
            <PlugZap className="mr-2 h-4 w-4" /> {testando ? "Testando..." : "Testar conexão"}
          </Button>
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Configuração do WhatsApp salva (exemplo).")}>Salvar</Button>
      </div>
    </div>
  );
}
