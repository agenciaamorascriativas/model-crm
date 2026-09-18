import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { eventosConversaoDemo, funisDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/conversoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conversões — Amoras CRM" },
      { name: "description", content: "Eventos de conversão e envio para plataformas de anúncio." },
      { property: "og:title", content: "Conversões — Amoras CRM" },
      { property: "og:description", content: "Eventos de conversão e envio para plataformas de anúncio." },
    ],
  }),
  component: ConversoesPage,
});

function ConversoesPage() {
  const [eventos, setEventos] = useState(eventosConversaoDemo);
  const [enviarMeta, setEnviarMeta] = useState(true);
  const [enviarGoogle, setEnviarGoogle] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Conversões" description="Mapeie eventos de conversão para os estágios do funil." demo />

      <Panel title="Eventos de conversão">
        <div className="space-y-3">
          {eventos.map((ev, idx) => (
            <div key={ev.id} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <p className="font-medium">{ev.nome}</p>
                <Badge variant="secondary" className="mt-1 font-normal">Estágio: {ev.estagio}</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Valor padrão (R$)</span>
                <Input
                  type="number"
                  value={ev.valorPadrao}
                  onChange={(e) =>
                    setEventos((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, valorPadrao: Number(e.target.value) } : x)),
                    )
                  }
                  className="w-32"
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Funis disponíveis: {funisDemo.join(", ")}
        </p>
      </Panel>

      <Panel title="Envio para plataformas de anúncio">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <p className="text-sm font-medium">Enviar conversões para Meta Ads</p>
            <Switch checked={enviarMeta} onCheckedChange={setEnviarMeta} />
          </div>
          <div className="flex items-center justify-between rounded-xl border p-4">
            <p className="text-sm font-medium">Enviar conversões para Google Ads</p>
            <Switch checked={enviarGoogle} onCheckedChange={setEnviarGoogle} />
          </div>
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Configuração de conversões salva (exemplo).")}>Salvar</Button>
      </div>
    </div>
  );
}
