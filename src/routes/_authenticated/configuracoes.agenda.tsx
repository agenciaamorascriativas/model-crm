import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Plus } from "lucide-react";
import { tiposCompromissoDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/agenda")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Agenda — Amoras CRM" },
      { name: "description", content: "Preferências de agendamento e link público de agenda." },
      { property: "og:title", content: "Agenda — Amoras CRM" },
      { property: "og:description", content: "Preferências de agendamento e link público de agenda." },
    ],
  }),
  component: AgendaConfigPage,
});

const linkPublico = "https://agenda.amoras.crm/atendimento-ana";

function AgendaConfigPage() {
  const [duracaoPadrao, setDuracaoPadrao] = useState("30");
  const [intervalo, setIntervalo] = useState("10");
  const [antecedencia, setAntecedencia] = useState("2");
  const [lembretes, setLembretes] = useState(true);
  const [tipos] = useState(tiposCompromissoDemo);

  return (
    <div className="space-y-6">
      <PageHeader title="Agenda" description="Regras de agendamento de compromissos." demo />

      <Panel title="Preferências gerais">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Duração padrão (min)</Label>
            <Input type="number" value={duracaoPadrao} onChange={(e) => setDuracaoPadrao(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Intervalo entre compromissos (min)</Label>
            <Input type="number" value={intervalo} onChange={(e) => setIntervalo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Antecedência mínima (horas)</Label>
            <Input type="number" value={antecedencia} onChange={(e) => setAntecedencia(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border p-4">
          <p className="text-sm font-medium">Enviar lembretes automáticos</p>
          <Switch checked={lembretes} onCheckedChange={setLembretes} />
        </div>
      </Panel>

      <Panel
        title="Tipos de compromisso"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.success("Tipo criado (exemplo).")}>
            <Plus className="mr-2 h-4 w-4" /> Novo tipo
          </Button>
        }
      >
        <div className="space-y-2">
          {tipos.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border p-3">
              <p className="font-medium">{t.nome}</p>
              <Badge variant="secondary">{t.duracao} min</Badge>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Link público de agendamento">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={linkPublico} readOnly className="max-w-md" />
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(linkPublico);
              toast.success("Link copiado.");
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copiar
          </Button>
        </div>
      </Panel>
    </div>
  );
}
