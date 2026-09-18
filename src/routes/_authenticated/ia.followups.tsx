import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel, StatCard, EmptyState } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Workflow, Plus, Users, Clock, Pause, Trash2, ArrowRight, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  REGUAS_FOLLOWUP,
  INSCRICOES_FOLLOWUP,
  type ReguaFollowup,
  type StatusRegua,
  type InscricaoRegua,
  type SituacaoInscricao,
} from "@/lib/demo/ia-operacao";

export const Route = createFileRoute("/_authenticated/ia/followups")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Follow-up automático — Amoras CRM" },
      { name: "description", content: "Réguas de acompanhamento automático conduzidas pela IA." },
      { property: "og:title", content: "Follow-up automático — Amoras CRM" },
      { property: "og:description", content: "Réguas de acompanhamento automático conduzidas pela IA." },
    ],
  }),
  component: FollowupsPage,
});

const STATUS_LABEL: Record<StatusRegua, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  rascunho: "Rascunho",
};

const SITUACAO_LABEL: Record<SituacaoInscricao, string> = {
  em_andamento: "Em andamento",
  pausada: "Pausada",
  concluida: "Concluída",
  saiu_por_resposta: "Saiu ao responder",
};

function FollowupsPage() {
  const [reguas, setReguas] = useState<ReguaFollowup[]>(REGUAS_FOLLOWUP);
  const [inscricoes, setInscricoes] = useState<InscricaoRegua[]>(INSCRICOES_FOLLOWUP);
  const [selecionada, setSelecionada] = useState<ReguaFollowup | null>(reguas[0] ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<ReguaFollowup | null>(null);

  function novaRegua() {
    setEditando({
      id: `regua-${Date.now()}`,
      nome: "",
      gatilho: "",
      status: "rascunho",
      contatosInscritos: 0,
      passos: [{ esperaDias: 1, mensagem: "", saiSeResponder: true }],
    });
    setDialogOpen(true);
  }

  function editar(r: ReguaFollowup) {
    setEditando({ ...r, passos: r.passos.map((p) => ({ ...p })) });
    setDialogOpen(true);
  }

  function salvar() {
    if (!editando || !editando.nome.trim()) {
      toast.error("Informe um nome para a régua.");
      return;
    }
    setReguas((atual) => {
      const existe = atual.some((r) => r.id === editando.id);
      return existe ? atual.map((r) => (r.id === editando.id ? editando : r)) : [editando, ...atual];
    });
    toast.success("Régua salva com sucesso.");
    setDialogOpen(false);
    setSelecionada(editando);
  }

  function pausarInscricao(id: string) {
    setInscricoes((atual) =>
      atual.map((i) => (i.id === id ? { ...i, situacao: "pausada" } : i)),
    );
    toast.success("Inscrição pausada.");
  }

  function removerInscricao(id: string) {
    setInscricoes((atual) => atual.filter((i) => i.id !== id));
    toast.success("Inscrição removida.");
  }

  const totalContatos = reguas.reduce((acc, r) => acc + r.contatosInscritos, 0);
  const ativas = reguas.filter((r) => r.status === "ativa").length;

  return (
    <PageContainer wide>
      <PageHeader
        title="Follow-up automático"
        description="Réguas de acompanhamento conduzidas pela IA para manter contato com clientes."
        demo
        actions={
          <Button onClick={novaRegua}>
            <Plus className="mr-2 h-4 w-4" /> Nova régua
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Réguas ativas" value={ativas} icon={Workflow} />
        <StatCard label="Réguas cadastradas" value={reguas.length} icon={Clock} />
        <StatCard label="Contatos inscritos" value={totalContatos} icon={Users} />
      </div>

      <Tabs defaultValue="reguas">
        <TabsList>
          <TabsTrigger value="reguas">Réguas</TabsTrigger>
          <TabsTrigger value="inscricoes">Inscrições</TabsTrigger>
        </TabsList>

        <TabsContent value="reguas" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <Panel title="Réguas de acompanhamento" description={`${reguas.length} cadastradas`}>
              <div className="space-y-2">
                {reguas.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelecionada(r)}
                    className={`w-full rounded-xl border p-3 text-left transition hover:bg-accent ${
                      selecionada?.id === r.id ? "border-primary bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{r.nome}</p>
                      <Badge variant={r.status === "ativa" ? "default" : "secondary"}>
                        {STATUS_LABEL[r.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.gatilho}</p>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>{r.passos.length} passo(s)</span>
                      <span>{r.contatosInscritos} contato(s)</span>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel
              title="Passo a passo"
              description={selecionada ? selecionada.nome : "Selecione uma régua"}
              actions={
                selecionada && (
                  <Button size="sm" variant="outline" onClick={() => editar(selecionada)}>
                    Editar
                  </Button>
                )
              }
            >
              {selecionada ? (
                <div className="space-y-3">
                  {selecionada.passos.map((passo, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {idx + 1}
                        </div>
                        {idx < selecionada.passos.length - 1 && (
                          <div className="h-6 w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 rounded-xl border p-3 text-sm">
                        <p className="text-xs text-muted-foreground">
                          Esperar {passo.esperaDias === 0 ? "imediatamente" : `${passo.esperaDias} dia(s)`} →
                          enviar mensagem
                        </p>
                        <p className="mt-1">{passo.mensagem}</p>
                        {passo.saiSeResponder && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3" /> Se o contato responder, sai da régua
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Nenhuma régua selecionada" icon={Workflow} />
              )}
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="inscricoes" className="mt-4">
          <Panel title="Inscrições" description={`${inscricoes.length} contatos em réguas`}>
            {inscricoes.length === 0 ? (
              <EmptyState title="Nenhuma inscrição" icon={Users} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contato</TableHead>
                    <TableHead>Régua</TableHead>
                    <TableHead>Passo atual</TableHead>
                    <TableHead>Próximo envio</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscricoes.map((i) => {
                    const regua = reguas.find((r) => r.id === i.reguaId);
                    return (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.contato}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{regua?.nome ?? "—"}</TableCell>
                        <TableCell>{i.passoAtual}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {i.proximoEnvio === "-" ? "—" : new Date(i.proximoEnvio).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{SITUACAO_LABEL[i.situacao]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" title="Pausar" onClick={() => pausarInscricao(i.id)}>
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" title="Remover" onClick={() => removerInscricao(i.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> {editando && reguas.some((r) => r.id === editando.id) ? "Editar régua" : "Nova régua"}
            </DialogTitle>
            <DialogDescription>Configure o gatilho e os passos de mensagens automáticas.</DialogDescription>
          </DialogHeader>
          {editando && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome da régua</Label>
                <Input
                  value={editando.nome}
                  onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                  placeholder="Ex: Carrinho abandonado"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gatilho</Label>
                <Input
                  value={editando.gatilho}
                  onChange={(e) => setEditando({ ...editando, gatilho: e.target.value })}
                  placeholder="Ex: Cliente não finaliza pedido em 2h"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Régua ativa</p>
                  <p className="text-xs text-muted-foreground">Contatos passam a entrar automaticamente</p>
                </div>
                <Switch
                  checked={editando.status === "ativa"}
                  onCheckedChange={(checked) =>
                    setEditando({ ...editando, status: checked ? "ativa" : "pausada" })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Primeira mensagem</Label>
                <Textarea
                  value={editando.passos[0]?.mensagem ?? ""}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      passos: [
                        {
                          esperaDias: editando.passos[0]?.esperaDias ?? 0,
                          saiSeResponder: editando.passos[0]?.saiSeResponder ?? true,
                          mensagem: e.target.value,
                        },
                        ...editando.passos.slice(1),
                      ],
                    })
                  }
                  placeholder="Escreva a mensagem do primeiro passo"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar}>Salvar régua</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
