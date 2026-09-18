import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { funisDemo, camposObrigatoriosDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/funis")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Preferências do funil — Amoras CRM" },
      { name: "description", content: "Funil padrão, campos obrigatórios e alertas de negócios parados." },
      { property: "og:title", content: "Preferências do funil — Amoras CRM" },
      { property: "og:description", content: "Funil padrão, campos obrigatórios e alertas de negócios parados." },
    ],
  }),
  component: FunisConfigPage,
});

function FunisConfigPage() {
  const [funilPadrao, setFunilPadrao] = useState(funisDemo[0]);
  const [diasParado, setDiasParado] = useState("7");
  const [previsaoAuto, setPrevisaoAuto] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Preferências do funil" description="Regras aplicadas ao funil de vendas." demo />

      <Panel title="Funil padrão">
        <div className="max-w-sm space-y-1.5">
          <Label>Funil usado ao criar novos negócios</Label>
          <Select value={funilPadrao} onValueChange={setFunilPadrao}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {funisDemo.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Panel>

      <Panel title="Campos obrigatórios por estágio">
        <div className="space-y-3">
          {camposObrigatoriosDemo.map((c) => (
            <div key={c.estagio} className="rounded-xl border p-3">
              <p className="mb-2 font-medium">{c.estagio}</p>
              <div className="flex flex-wrap gap-2">
                {c.campos.map((campo) => (
                  <Badge key={campo} variant="secondary">{campo}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Aviso de negócio parado">
        <div className="max-w-xs space-y-1.5">
          <Label>Avisar quando um negócio ficar parado por (dias)</Label>
          <Input type="number" value={diasParado} onChange={(e) => setDiasParado(e.target.value)} />
        </div>
      </Panel>

      <Panel title="Previsão de fechamento">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Calcular previsão de fechamento automaticamente</p>
            <p className="text-sm text-muted-foreground">Com base no histórico de negócios semelhantes.</p>
          </div>
          <Switch checked={previsaoAuto} onCheckedChange={setPrevisaoAuto} />
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Preferências do funil salvas (exemplo).")}>Salvar</Button>
      </div>
    </div>
  );
}
