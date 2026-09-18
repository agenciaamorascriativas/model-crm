import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { horarioFuncionamentoDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/atendimento")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Atendimento — Amoras CRM" },
      { name: "description", content: "Horário de funcionamento e regras de atendimento." },
      { property: "og:title", content: "Atendimento — Amoras CRM" },
      { property: "og:description", content: "Horário de funcionamento e regras de atendimento." },
    ],
  }),
  component: AtendimentoPage,
});

function AtendimentoPage() {
  const [horarios, setHorarios] = useState(horarioFuncionamentoDemo);
  const [saudacao, setSaudacao] = useState("Olá! Obrigado por entrar em contato. Já já falamos com você. 😊");
  const [ausencia, setAusencia] = useState("No momento estamos fora do horário de atendimento. Retornaremos em breve!");
  const [tempoEspera, setTempoEspera] = useState("5");
  const [distribuicao, setDistribuicao] = useState("automatica");
  const [encerramentoAuto, setEncerramentoAuto] = useState(true);

  function update(idx: number, patch: Partial<(typeof horarios)[number]>) {
    setHorarios((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Atendimento" description="Regras aplicadas ao atendimento via WhatsApp." demo />

      <Panel title="Horário de funcionamento">
        <div className="space-y-2">
          {horarios.map((h, idx) => (
            <div key={h.dia} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <Switch checked={h.ativo} onCheckedChange={(v) => update(idx, { ativo: v })} />
              <span className="w-32 text-sm font-medium">{h.dia}</span>
              <Input
                type="time"
                value={h.inicio}
                disabled={!h.ativo}
                onChange={(e) => update(idx, { inicio: e.target.value })}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">até</span>
              <Input
                type="time"
                value={h.fim}
                disabled={!h.ativo}
                onChange={(e) => update(idx, { fim: e.target.value })}
                className="w-32"
              />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Mensagem de saudação">
          <Textarea value={saudacao} onChange={(e) => setSaudacao(e.target.value)} rows={4} />
        </Panel>
        <Panel title="Mensagem de ausência">
          <Textarea value={ausencia} onChange={(e) => setAusencia(e.target.value)} rows={4} />
        </Panel>
      </div>

      <Panel title="Regras de fila">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tempo limite de espera (minutos)</Label>
            <Input type="number" value={tempoEspera} onChange={(e) => setTempoEspera(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Distribuição de conversas</Label>
            <Select value={distribuicao} onValueChange={setDistribuicao}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="automatica">Automática</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Encerramento automático de conversas inativas</p>
            <p className="text-sm text-muted-foreground">Após 24 horas sem resposta do cliente.</p>
          </div>
          <Switch checked={encerramentoAuto} onCheckedChange={setEncerramentoAuto} />
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Regras de atendimento salvas (exemplo).")}>Salvar</Button>
      </div>
    </div>
  );
}
