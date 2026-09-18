import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, RotateCw } from "lucide-react";
import { webhooksDemo, historicoEntregasWebhookDemo, eventosNotificacaoDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/webhooks")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Webhooks — Amoras CRM" },
      { name: "description", content: "Endpoints, eventos e histórico de entregas de webhooks." },
      { property: "og:title", content: "Webhooks — Amoras CRM" },
      { property: "og:description", content: "Endpoints, eventos e histórico de entregas de webhooks." },
    ],
  }),
  component: WebhooksPage,
});

function WebhooksPage() {
  const [webhooks, setWebhooks] = useState(webhooksDemo);
  const [aberto, setAberto] = useState(false);
  const [url, setUrl] = useState("");
  const [eventosSel, setEventosSel] = useState<string[]>([]);

  function salvar() {
    if (!url.trim()) return;
    setWebhooks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), url, eventos: eventosSel, status: "Ativo" },
    ]);
    toast.success("Webhook criado.");
    setAberto(false);
    setUrl("");
    setEventosSel([]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Receba eventos do CRM em sistemas externos."
        demo
        actions={
          <Button onClick={() => setAberto(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo webhook
          </Button>
        }
      />

      <Panel title="Endpoints cadastrados">
        <div className="space-y-3">
          {webhooks.map((w) => (
            <div key={w.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm">{w.url}</p>
                <Badge variant={w.status === "Ativo" ? "secondary" : "outline"}>{w.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {w.eventos.map((ev) => (
                  <Badge key={ev} variant="outline" className="font-normal">{ev}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Histórico de entregas">
        <div className="space-y-2">
          {historicoEntregasWebhookDemo.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-xl border p-3 text-sm">
              <div>
                <p className="font-medium">{h.evento}</p>
                <p className="text-muted-foreground">{h.data}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={h.codigo < 300 ? "secondary" : "destructive"}>{h.codigo}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.success("Entrega reenviada (exemplo).")}
                >
                  <RotateCw className="mr-2 h-4 w-4" /> Reenviar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>URL de destino</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-1.5">
              <Label>Eventos</Label>
              <div className="space-y-2">
                {eventosNotificacaoDemo.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={eventosSel.includes(ev.label)}
                      onCheckedChange={(v) =>
                        setEventosSel((prev) =>
                          v ? [...prev, ev.label] : prev.filter((x) => x !== ev.label),
                        )
                      }
                    />
                    {ev.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={salvar}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
