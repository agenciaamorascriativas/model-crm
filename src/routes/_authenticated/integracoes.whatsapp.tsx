import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Panel, PageHeader } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Copy, PlugZap, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AntibanSettings } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/integracoes/whatsapp")({
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
      <PageHeader
        title="WhatsApp"
        description="Escolha e configure a conexão do atendimento."
        demo
      />

      <AntibanPanel />

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
              <p className="font-medium">{m === "gateway" ? "Gateway próprio" : "Canal oficial"}</p>
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
        <Button onClick={() => toast.success("Configuração do WhatsApp salva (exemplo).")}>
          Salvar
        </Button>
      </div>
    </div>
  );
}

const ANTIBAN_DEFAULT: AntibanSettings = {
  enabled: true,
  max_per_minute: 20,
  jitter_min_seconds: 2,
  jitter_max_seconds: 6,
  window_start: "08:00",
  window_end: "20:00",
};

function AntibanPanel() {
  const queryClient = useQueryClient();
  const [salvando, setSalvando] = useState(false);
  const [config, setConfig] = useState<AntibanSettings | null>(null);

  const { data } = useQuery({
    queryKey: ["app_settings", "antiban"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("antiban_settings")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return (data?.antiban_settings as unknown as AntibanSettings) ?? ANTIBAN_DEFAULT;
    },
  });

  useEffect(() => {
    if (data) setConfig(data);
  }, [data]);

  async function salvar() {
    if (!config) return;
    setSalvando(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ antiban_settings: config as unknown as never })
      .eq("id", 1);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar. Só administradores podem editar.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["app_settings", "antiban"] });
    toast.success("Regras de antibanimento salvas.");
  }

  if (!config) return null;

  return (
    <Panel
      title="Antibanimento"
      description="Protege o número: limite de envio, variação de tempo e janela de horário. Já vale para o envio de hoje e vai valer para o gateway real quando conectado."
    >
      <div className="mb-4 flex items-center justify-between rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <p className="font-medium">Ativo</p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Máximo de mensagens por minuto</Label>
          <Input
            type="number"
            min={1}
            value={config.max_per_minute}
            onChange={(e) => setConfig({ ...config, max_per_minute: Number(e.target.value) || 1 })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Janela de envio</Label>
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={config.window_start}
              onChange={(e) => setConfig({ ...config, window_start: e.target.value })}
            />
            <span className="text-sm text-muted-foreground">até</span>
            <Input
              type="time"
              value={config.window_end}
              onChange={(e) => setConfig({ ...config, window_end: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Variação entre envios (segundos)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={config.jitter_min_seconds}
              onChange={(e) =>
                setConfig({ ...config, jitter_min_seconds: Number(e.target.value) || 0 })
              }
            />
            <span className="text-sm text-muted-foreground">a</span>
            <Input
              type="number"
              min={0}
              value={config.jitter_max_seconds}
              onChange={(e) =>
                setConfig({ ...config, jitter_max_seconds: Number(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={salvar} disabled={salvando}>
          {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </Panel>
  );
}
