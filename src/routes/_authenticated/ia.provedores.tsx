import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyRound, PlugZap, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PROVEDORES_IA, type ProvedorIA, type TipoTarefaIA } from "@/lib/demo/ia-operacao";

export const Route = createFileRoute("/_authenticated/ia/provedores")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Provedores e chaves — Amoras CRM" },
      { name: "description", content: "Configure provedores de IA e chaves próprias por tarefa." },
      { property: "og:title", content: "Provedores e chaves — Amoras CRM" },
      { property: "og:description", content: "Configure provedores de IA e chaves próprias por tarefa." },
    ],
  }),
  component: ProvedoresPage,
});

const TAREFAS: { valor: TipoTarefaIA; rotulo: string }[] = [
  { valor: "conversa", rotulo: "Conversa" },
  { valor: "resumo", rotulo: "Resumo" },
  { valor: "transcricao", rotulo: "Transcrição" },
];

function ProvedoresPage() {
  const [provedores, setProvedores] = useState<ProvedorIA[]>(PROVEDORES_IA);
  const [testando, setTestando] = useState<string | null>(null);

  function alternarChavePropria(id: string, usa: boolean) {
    setProvedores((atual) => atual.map((p) => (p.id === id ? { ...p, usaChavePropria: usa } : p)));
  }

  function atualizarModelo(id: string, tarefa: TipoTarefaIA, modelo: string) {
    setProvedores((atual) =>
      atual.map((p) =>
        p.id === id ? { ...p, modelosPorTarefa: { ...p.modelosPorTarefa, [tarefa]: modelo } } : p,
      ),
    );
  }

  function testarConexao(id: string) {
    setTestando(id);
    setTimeout(() => {
      setTestando(null);
      toast.success("Conexão testada com sucesso.");
    }, 900);
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Provedores e chaves"
        description="Escolha usar o provedor padrão da plataforma ou conectar suas próprias chaves de IA."
        demo
      />

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Sem chave própria, a plataforma cuida de tudo</AlertTitle>
        <AlertDescription>
          Quando um provedor não tem chave própria conectada, o sistema usa automaticamente o provedor
          padrão da plataforma para não interromper o atendimento.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        {provedores.map((p) => (
          <Panel
            key={p.id}
            title={p.nome}
            description={p.descricao}
            actions={
              p.padraoPlataforma ? (
                <Badge className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ativo por padrão
                </Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Usar chave própria</span>
                  <Switch
                    checked={p.usaChavePropria}
                    onCheckedChange={(checked) => alternarChavePropria(p.id, checked)}
                  />
                </div>
              )
            }
          >
            {!p.padraoPlataforma && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-xs">
                    <KeyRound className="h-3.5 w-3.5" /> Chave de API
                  </Label>
                  <div className="flex gap-2">
                    <Input value={p.chaveMascarada} readOnly disabled={!p.usaChavePropria} />
                    <Button
                      variant="outline"
                      disabled={!p.usaChavePropria}
                      onClick={() => testarConexao(p.id)}
                    >
                      <PlugZap className="mr-2 h-4 w-4" />
                      {testando === p.id ? "Testando..." : "Testar conexão"}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {TAREFAS.map((t) => (
                    <div key={t.valor} className="space-y-1.5">
                      <Label className="text-xs">{t.rotulo}</Label>
                      <Select
                        value={p.modelosPorTarefa[t.valor]}
                        onValueChange={(v) => atualizarModelo(p.id, t.valor, v)}
                        disabled={!p.usaChavePropria}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {p.modelosDisponiveis.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                          <SelectItem value={p.modelosPorTarefa[t.valor]}>
                            {p.modelosPorTarefa[t.valor]}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {p.padraoPlataforma && (
              <p className="text-sm text-muted-foreground">
                Modelo utilizado para todas as tarefas: {p.modelosPorTarefa.conversa}.
              </p>
            )}
          </Panel>
        ))}
      </div>
    </PageContainer>
  );
}
