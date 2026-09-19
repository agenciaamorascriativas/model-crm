import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound, PlugZap, Info, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  listAiProviderCredentials,
  saveAiProviderCredential,
  setAiProviderActive,
  deleteAiProviderCredential,
  testAiProviderCredential,
} from "@/lib/ai-provider.functions";
import type { AiProviderCredential } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/ia/provedores")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Provedores e chaves — Amoras CRM" },
      { name: "description", content: "Configure provedores de IA e chaves próprias por tarefa." },
      { property: "og:title", content: "Provedores e chaves — Amoras CRM" },
      {
        property: "og:description",
        content: "Configure provedores de IA e chaves próprias por tarefa.",
      },
    ],
  }),
  component: ProvedoresPage,
});

const PROVEDORES = [
  {
    id: "openai" as const,
    nome: "OpenAI",
    descricao: "Use sua própria chave para ter controle total sobre custo e limites.",
    placeholder: "sk-...",
  },
  {
    id: "anthropic" as const,
    nome: "Anthropic",
    descricao: "Alternativa com chave própria para tarefas de conversa e resumo.",
    placeholder: "sk-ant-...",
  },
  {
    id: "google" as const,
    nome: "Google",
    descricao: "Use modelos Gemini com sua própria chave de API.",
    placeholder: "AIza...",
  },
];

function ProvedoresPage() {
  const queryClient = useQueryClient();
  const [dialogProvider, setDialogProvider] = useState<(typeof PROVEDORES)[number] | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [testando, setTestando] = useState<string | null>(null);

  const { data: credenciais, isLoading } = useQuery({
    queryKey: ["ai-provider-credentials"],
    queryFn: () => listAiProviderCredentials(),
  });

  function credencialDe(provider: string) {
    return (credenciais as AiProviderCredential[] | undefined)?.find(
      (c) => c.provider === provider,
    );
  }

  const salvar = useMutation({
    mutationFn: async (provider: string) => {
      await saveAiProviderCredential({ data: { provider: provider as never, apiKey } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-provider-credentials"] });
      toast.success("Chave salva e ativada.");
      setDialogProvider(null);
      setApiKey("");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar a chave."),
  });

  const alternarAtivo = useMutation({
    mutationFn: async ({ provider, active }: { provider: string; active: boolean }) => {
      await setAiProviderActive({ data: { provider: provider as never, active } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-provider-credentials"] }),
    onError: () => toast.error("Não foi possível atualizar o provedor."),
  });

  const remover = useMutation({
    mutationFn: async (provider: string) => {
      await deleteAiProviderCredential({ data: { provider: provider as never } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-provider-credentials"] });
      toast.success("Chave removida. Voltou para o provedor padrão da plataforma.");
    },
    onError: () => toast.error("Não foi possível remover a chave."),
  });

  async function testar(provider: string) {
    setTestando(provider);
    try {
      await testAiProviderCredential({ data: { provider: provider as never } });
      toast.success("Conexão testada com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao testar a conexão.");
    } finally {
      setTestando(null);
    }
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Provedores e chaves"
        description="Escolha usar o provedor padrão da plataforma ou conectar suas próprias chaves de IA."
      />

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Sem chave própria, a plataforma cuida de tudo</AlertTitle>
        <AlertDescription>
          Quando um provedor não tem chave própria conectada, o sistema usa automaticamente o
          provedor padrão da plataforma para não interromper o atendimento.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Provedor Padrão da Plataforma"
          description="Já vem ativo e não exige configuração. Ideal para começar rapidamente."
          actions={
            <Badge className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Ativo por padrão
            </Badge>
          }
        >
          <p className="text-sm text-muted-foreground">
            Usado sempre que nenhum provedor abaixo tiver uma chave própria ativa.
          </p>
        </Panel>

        {PROVEDORES.map((p) => {
          const cred = credencialDe(p.id);
          return (
            <Panel
              key={p.id}
              title={p.nome}
              description={p.descricao}
              actions={
                cred ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Usar chave própria</span>
                    <Switch
                      checked={cred.active}
                      onCheckedChange={(v) => alternarAtivo.mutate({ provider: p.id, active: v })}
                    />
                  </div>
                ) : null
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : cred ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <KeyRound className="h-3.5 w-3.5" /> Chave de API
                    </Label>
                    <Input value={cred.key_hint} readOnly disabled={!cred.active} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      disabled={!cred.active || testando === p.id}
                      onClick={() => testar(p.id)}
                    >
                      <PlugZap className="mr-2 h-4 w-4" />
                      {testando === p.id ? "Testando..." : "Testar conexão"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => remover.mutate(p.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setDialogProvider(p)}>
                  <KeyRound className="mr-2 h-4 w-4" /> Adicionar chave própria
                </Button>
              )}
            </Panel>
          );
        })}
      </div>

      <Dialog open={dialogProvider !== null} onOpenChange={(o) => !o && setDialogProvider(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar chave — {dialogProvider?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Chave de API</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={dialogProvider?.placeholder}
            />
            <p className="text-xs text-muted-foreground">
              A chave fica guardada com acesso restrito ao servidor; ninguém consegue vê-la de novo
              depois de salva, só o valor mascarado.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogProvider(null)}>
              Cancelar
            </Button>
            <Button
              disabled={apiKey.trim().length < 8 || salvar.isPending}
              onClick={() => dialogProvider && salvar.mutate(dialogProvider.id)}
            >
              {salvar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
