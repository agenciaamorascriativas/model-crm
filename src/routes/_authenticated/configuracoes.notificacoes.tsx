import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { eventosNotificacaoDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/notificacoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Notificações — Amoras CRM" },
      { name: "description", content: "Escolha como e quando você quer ser avisado." },
      { property: "og:title", content: "Notificações — Amoras CRM" },
      { property: "og:description", content: "Escolha como e quando você quer ser avisado." },
    ],
  }),
  component: NotificacoesPage,
});

const canais = ["sistema", "email", "push"] as const;
type Canal = (typeof canais)[number];
const canalLabel: Record<Canal, string> = { sistema: "No sistema", email: "E-mail", push: "Push" };

function NotificacoesPage() {
  const [matriz, setMatriz] = useState<Record<string, Record<Canal, boolean>>>(
    Object.fromEntries(
      eventosNotificacaoDemo.map((e) => [e.id, { sistema: true, email: e.id !== "mencao", push: false }]),
    ),
  );
  const [silencioInicio, setSilencioInicio] = useState("20:00");
  const [silencioFim, setSilencioFim] = useState("08:00");
  const [resumoDiario, setResumoDiario] = useState(true);

  function toggle(eventoId: string, canal: Canal) {
    setMatriz((prev) => ({
      ...prev,
      [eventoId]: {
        sistema: prev[eventoId]?.sistema ?? false,
        email: prev[eventoId]?.email ?? false,
        push: prev[eventoId]?.push ?? false,
        [canal]: !prev[eventoId]?.[canal],
      },
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notificações" description="Defina o que você quer receber e por onde." demo />

      <Panel title="Eventos e canais">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-normal">Evento</th>
                {canais.map((c) => (
                  <th key={c} className="px-4 py-2 text-center font-normal">
                    {canalLabel[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventosNotificacaoDemo.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{e.label}</td>
                  {canais.map((c) => (
                    <td key={c} className="px-4 py-3 text-center">
                      <Switch checked={matriz[e.id]?.[c] ?? false} onCheckedChange={() => toggle(e.id, c)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Horário de silêncio" description="Notificações não sonoras neste período.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Início</Label>
            <Input type="time" value={silencioInicio} onChange={(e) => setSilencioInicio(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Fim</Label>
            <Input type="time" value={silencioFim} onChange={(e) => setSilencioFim(e.target.value)} />
          </div>
        </div>
      </Panel>

      <Panel title="Resumo diário" description="Receba um e-mail com o resumo do dia.">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <p className="text-sm">Enviar resumo diário por e-mail às 18h</p>
          <Switch checked={resumoDiario} onCheckedChange={setResumoDiario} />
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Preferências de notificação salvas (exemplo).")}>
          Salvar preferências
        </Button>
      </div>
    </div>
  );
}
