import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { campanhasMetaAdsDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/meta-ads")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Meta Ads — Amoras CRM" },
      { name: "description", content: "Conta de anúncios, pixel e campanhas do Meta Ads." },
      { property: "og:title", content: "Meta Ads — Amoras CRM" },
      { property: "og:description", content: "Conta de anúncios, pixel e campanhas do Meta Ads." },
    ],
  }),
  component: MetaAdsPage,
});

function MetaAdsPage() {
  const [conta, setConta] = useState("act_1029384756");
  const [pixel, setPixel] = useState("839201847562910");
  const [token, setToken] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader title="Meta Ads" description="Integração com campanhas do Facebook e Instagram." demo />

      <Panel title="Conta de anúncios">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>ID da conta de anúncios</Label>
            <Input value={conta} onChange={(e) => setConta(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>ID do Pixel</Label>
            <Input value={pixel} onChange={(e) => setPixel(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Token de acesso</Label>
            <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="••••••••••••" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => toast.success("Conexão com Meta Ads salva (exemplo).")}>Salvar</Button>
        </div>
      </Panel>

      <Panel title="Campanhas" description="Exemplo de campanhas sincronizadas.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-normal">Campanha</th>
                <th className="px-4 py-2 font-normal">Status</th>
                <th className="px-4 py-2 font-normal">Leads</th>
                <th className="px-4 py-2 font-normal">Custo por lead</th>
              </tr>
            </thead>
            <tbody>
              {campanhasMetaAdsDemo.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{c.nome}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "Ativa" ? "secondary" : "outline"}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{c.leads}</td>
                  <td className="px-4 py-3">
                    {c.custoPorLead.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
