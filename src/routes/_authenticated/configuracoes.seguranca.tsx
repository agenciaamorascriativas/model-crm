import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { QrCode, MonitorSmartphone, LogOut } from "lucide-react";
import { sessoesAtivasDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/seguranca")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Segurança — Amoras CRM" },
      { name: "description", content: "Senha, verificação em duas etapas e sessões ativas." },
      { property: "og:title", content: "Segurança — Amoras CRM" },
      { property: "og:description", content: "Senha, verificação em duas etapas e sessões ativas." },
    ],
  }),
  component: SegurancaPage,
});

function SegurancaPage() {
  const [duasEtapas, setDuasEtapas] = useState(false);
  const [sessoes, setSessoes] = useState(sessoesAtivasDemo);

  return (
    <div className="space-y-6">
      <PageHeader title="Segurança" description="Proteja o acesso à sua conta." demo />

      <Panel title="Trocar senha">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Senha atual</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar nova senha</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A senha deve ter no mínimo 8 caracteres, com letras e números.
        </p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success("Senha atualizada (exemplo).")}>Atualizar senha</Button>
        </div>
      </Panel>

      <Panel title="Verificação em duas etapas" description="Adicione uma camada extra de segurança no login.">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Exigir código do aplicativo autenticador</p>
            <p className="text-sm text-muted-foreground">
              {duasEtapas ? "Ativada para sua conta." : "Desativada no momento."}
            </p>
          </div>
          <Switch checked={duasEtapas} onCheckedChange={setDuasEtapas} />
        </div>
        {duasEtapas && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-dashed p-4">
            <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-muted">
              <QrCode className="h-14 w-14 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Escaneie o QR code</p>
              <p className="text-sm text-muted-foreground">
                Use o Google Authenticator ou similar para concluir a configuração.
              </p>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Sessões ativas" description="Dispositivos conectados à sua conta.">
        <div className="space-y-3">
          {sessoes.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border p-4">
              <MonitorSmartphone className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  {s.dispositivo}
                  {s.atual && <Badge variant="secondary">Este dispositivo</Badge>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {s.local} · {s.atividade}
                </p>
              </div>
              {!s.atual && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSessoes((prev) => prev.filter((x) => x.id !== s.id));
                    toast.success("Sessão encerrada.");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Encerrar
                </Button>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Política de senha" description="Regras aplicadas a toda a equipe.">
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Mínimo de 8 caracteres</li>
          <li>Ao menos uma letra maiúscula e um número</li>
          <li>Troca obrigatória a cada 90 dias</li>
          <li>Bloqueio após 5 tentativas incorretas</li>
        </ul>
      </Panel>
    </div>
  );
}
