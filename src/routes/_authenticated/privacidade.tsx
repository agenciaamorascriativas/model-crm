import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel, StatCard } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { ShieldCheck, Clock, AlertOctagon, Download, CheckCircle2, ArrowLeft } from "lucide-react";
import {
  indicadoresLGPD,
  solicitacoesLGPD,
  configuracaoRetencao,
  configuracaoConsentimento,
  type SolicitacaoLGPD,
  type StatusSolicitacaoLGPD,
} from "@/lib/demo/relatorios";

export const Route = createFileRoute("/_authenticated/privacidade")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Privacidade — Amoras CRM" },
      { name: "description", content: "Pedidos de titulares de dados (LGPD), retenção e consentimento." },
      { property: "og:title", content: "Privacidade — Amoras CRM" },
      { property: "og:description", content: "Pedidos de titulares de dados (LGPD), retenção e consentimento." },
    ],
  }),
  component: PrivacidadePage,
});

const tipoRotulo = {
  acesso: "Acesso",
  correção: "Correção",
  exclusão: "Exclusão",
  portabilidade: "Portabilidade",
};

const statusInfo: Record<StatusSolicitacaoLGPD, { rotulo: string; variante: "default" | "secondary" | "destructive" | "outline" }> = {
  aberto: { rotulo: "Aberto", variante: "secondary" },
  "em andamento": { rotulo: "Em andamento", variante: "outline" },
  atendido: { rotulo: "Atendido", variante: "default" },
  atrasado: { rotulo: "Atrasado", variante: "destructive" },
};

function PrivacidadePage() {
  const [selecionado, setSelecionado] = useState<SolicitacaoLGPD | null>(null);
  const [consentimentos, setConsentimentos] = useState(configuracaoConsentimento);

  return (
    <PageContainer wide>
      <Link to="/configuracoes" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para Configurações
      </Link>
      <PageHeader
        title="Privacidade (LGPD)"
        description="Gerencie pedidos de titulares de dados, retenção e consentimento."
        demo
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pedidos abertos" value={indicadoresLGPD.pedidosAbertos} icon={ShieldCheck} />
        <StatCard label="No prazo" value={indicadoresLGPD.pedidosNoPrazo} icon={Clock} />
        <StatCard label="Atrasados" value={indicadoresLGPD.pedidosAtrasados} icon={AlertOctagon} />
      </div>

      <Panel title="Pedidos de titulares" className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitacoesLGPD.map((s) => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => setSelecionado(s)}>
                <TableCell>{tipoRotulo[s.tipo]}</TableCell>
                <TableCell>
                  <p className="font-medium">{s.solicitante}</p>
                  <p className="text-xs text-muted-foreground">{s.contato}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{s.prazo}</TableCell>
                <TableCell>
                  <Badge variant={statusInfo[s.status].variante}>{statusInfo[s.status].rotulo}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Retenção de dados" description="Prazos de guarda por tipo de informação">
          <ul className="space-y-3">
            {configuracaoRetencao.map((r) => (
              <li key={r.item} className="flex items-center justify-between gap-3 border-b pb-3 text-sm last:border-0 last:pb-0">
                <span>{r.item}</span>
                <span className="whitespace-nowrap text-xs text-muted-foreground">{r.prazo}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Consentimento" description="Finalidades de uso de dados ativas">
          <ul className="space-y-3">
            {consentimentos.map((c, i) => (
              <li key={c.finalidade} className="flex items-center justify-between gap-3 border-b pb-3 text-sm last:border-0 last:pb-0">
                <span>{c.finalidade}</span>
                <Switch
                  checked={c.ativo}
                  onCheckedChange={(v) =>
                    setConsentimentos((prev) => prev.map((item, idx) => (idx === i ? { ...item, ativo: v } : item)))
                  }
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Sheet open={!!selecionado} onOpenChange={(o) => !o && setSelecionado(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selecionado ? tipoRotulo[selecionado.tipo] : ""} — {selecionado?.solicitante}
            </SheetTitle>
            <SheetDescription>
              {selecionado?.contato} · Criado em {selecionado?.criadoEm} · Prazo {selecionado?.prazo}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {selecionado && (
              <Badge variant={statusInfo[selecionado.status].variante}>{statusInfo[selecionado.status].rotulo}</Badge>
            )}
            <div>
              <p className="mb-2 text-sm font-medium">Histórico do atendimento</p>
              <ul className="space-y-2">
                {selecionado?.historico.map((h, i) => (
                  <li key={i} className="rounded-xl border p-3 text-sm">
                    <p className="text-xs font-semibold text-muted-foreground">{h.data}</p>
                    <p className="mt-0.5">{h.evento}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => toast.success("Pedido marcado como atendido.")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar como atendido
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast("Exportação de dados iniciada (exemplo visual).")}
            >
              <Download className="mr-2 h-4 w-4" /> Exportar dados
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
