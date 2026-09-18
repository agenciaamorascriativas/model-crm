import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel, formatBRL } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Send, Copy, Archive, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  PROPOSTAS,
  totalPropostaCentavos,
  type Proposta,
  type StatusProposta,
} from "@/lib/demo/ia-operacao";

export const Route = createFileRoute("/_authenticated/ia/propostas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Propostas — Amoras CRM" },
      { name: "description", content: "Propostas comerciais geradas automaticamente pela IA." },
      { property: "og:title", content: "Propostas — Amoras CRM" },
      { property: "og:description", content: "Propostas comerciais geradas automaticamente pela IA." },
    ],
  }),
  component: PropostasPage,
});

const STATUS_LABEL: Record<StatusProposta, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aceita: "Aceita",
  recusada: "Recusada",
};

const STATUS_VARIANT: Record<StatusProposta, "secondary" | "default" | "outline" | "destructive"> = {
  rascunho: "outline",
  enviada: "secondary",
  aceita: "default",
  recusada: "destructive",
};

function PropostasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>(PROPOSTAS);
  const [selecionada, setSelecionada] = useState<Proposta | null>(null);

  function atualizarStatus(id: string, status: StatusProposta, mensagem: string) {
    setPropostas((atual) => atual.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(mensagem);
  }

  function duplicar(p: Proposta) {
    const nova: Proposta = { ...p, id: `${p.id}-copia-${Date.now()}`, status: "rascunho" };
    setPropostas((atual) => [nova, ...atual]);
    toast.success("Proposta duplicada como rascunho.");
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Propostas"
        description="Propostas comerciais geradas automaticamente pela IA a partir das conversas."
        demo
      />
      <Panel title="Todas as propostas" description={`${propostas.length} propostas`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contato</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propostas.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelecionada(p)}>
                <TableCell className="font-medium">{p.contato}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.itens.length} item(ns)</TableCell>
                <TableCell>{formatBRL(totalPropostaCentavos(p))}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(p.data).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Enviar"
                      onClick={() => atualizarStatus(p.id, "enviada", "Proposta enviada ao contato.")}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Duplicar" onClick={() => duplicar(p)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Arquivar"
                      onClick={() => atualizarStatus(p.id, "recusada", "Proposta arquivada.")}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={!!selecionada} onOpenChange={(open) => !open && setSelecionada(null)}>
        <DialogContent className="max-w-lg">
          {selecionada && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Proposta para {selecionada.contato}
                </DialogTitle>
                <DialogDescription>
                  Gerada em {new Date(selecionada.data).toLocaleDateString("pt-BR")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {selecionada.itens.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{item.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantidade}x {formatBRL(item.valorUnitarioCentavos)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatBRL(item.quantidade * item.valorUnitarioCentavos)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-3">
                  <p className="font-display font-semibold">Total</p>
                  <p className="font-display text-lg font-bold">
                    {formatBRL(totalPropostaCentavos(selecionada))}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => duplicar(selecionada)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicar
                </Button>
                <Button
                  onClick={() => {
                    atualizarStatus(selecionada.id, "enviada", "Proposta enviada ao contato.");
                    setSelecionada(null);
                  }}
                >
                  <Send className="mr-2 h-4 w-4" /> Enviar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
