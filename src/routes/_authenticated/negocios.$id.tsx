import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer, PageHeader, EmptyState, Panel, formatBRL } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  XCircle,
  CheckCircle2,
  User,
  CalendarClock,
  TrendingUp,
  SearchX,
  Clock,
  ArrowUpRight,
  MessageCircle,
  Phone,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getNegocio,
  getContato,
  getFunil,
  getProduto,
  LINHA_DO_TEMPO,
} from "@/lib/demo/vendas";

export const Route = createFileRoute("/_authenticated/negocios/$id")({
  ssr: false,
  head: ({ params }) => {
    const negocio = getNegocio(params.id);
    const titulo = negocio?.titulo ?? "Negócio não encontrado";
    return {
      meta: [
        { title: `${titulo} — Amoras CRM` },
        { name: "description", content: `Ficha do negócio ${titulo}.` },
        { property: "og:title", content: `${titulo} — Amoras CRM` },
        { property: "og:description", content: `Ficha do negócio ${titulo}.` },
      ],
    };
  },
  component: NegocioFichaPage,
});

const ICONES_LINHA_DO_TEMPO: Record<string, { icon: typeof MessageCircle; cor: string }> = {
  mensagem_enviada: { icon: MessageCircle, cor: "text-primary" },
  mensagem_recebida: { icon: MessageCircle, cor: "text-accent-foreground" },
  ligacao: { icon: Phone, cor: "text-chart-2" },
  nota: { icon: StickyNote, cor: "text-chart-4" },
  estagio: { icon: ArrowUpRight, cor: "text-chart-3" },
  reuniao: { icon: CalendarClock, cor: "text-chart-1" },
  tarefa: { icon: CheckCircle2, cor: "text-primary" },
};

function NegocioFichaPage() {
  const { id } = Route.useParams();
  const negocioOriginal = getNegocio(id);

  if (!negocioOriginal) {
    return (
      <PageContainer>
        <PageHeader title="Negócio não encontrado" demo />
        <EmptyState
          icon={SearchX}
          title="Não encontramos esse negócio"
          description="Ele pode ter sido removido da base de exemplo. Volte para o funil e tente novamente."
          action={
            <Button asChild>
              <Link to="/funil">Voltar para o funil</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const contato = getContato(negocioOriginal.contatoId);
  const funil = getFunil(negocioOriginal.funilId);
  const [status, setStatus] = useState(negocioOriginal.status);
  const [etapaId, setEtapaId] = useState(negocioOriginal.etapaId);
  const [motivoPerda, setMotivoPerda] = useState(negocioOriginal.motivoPerda ?? "");
  const [dialogAberto, setDialogAberto] = useState<"ganho" | "perdido" | null>(null);
  const [motivo, setMotivo] = useState("");

  const etapaAtualIndex = funil?.etapas.findIndex((e) => e.id === etapaId) ?? 0;
  const etapaAtual = funil?.etapas.find((e) => e.id === etapaId);
  const timeline = LINHA_DO_TEMPO[negocioOriginal.contatoId] ?? [];

  const totalItens = negocioOriginal.itens.reduce((s, item) => s + item.quantidade * item.precoCents, 0);

  const confirmarDesfecho = () => {
    if (dialogAberto === "ganho") {
      setStatus("ganho");
      toast.success("Negócio marcado como ganho!");
    } else if (dialogAberto === "perdido") {
      setStatus("perdido");
      setMotivoPerda(motivo);
      toast("Negócio marcado como perdido.");
    }
    setDialogAberto(null);
    setMotivo("");
  };

  return (
    <PageContainer wide>
      <PageHeader
        title={negocioOriginal.titulo}
        description={funil?.nome}
        demo
        actions={
          <>
            <Button
              variant="outline"
              className="text-emerald-700"
              disabled={status !== "aberto"}
              onClick={() => setDialogAberto("ganho")}
            >
              <Trophy className="mr-2 h-4 w-4" /> Marcar ganho
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              disabled={status !== "aberto"}
              onClick={() => setDialogAberto("perdido")}
            >
              <XCircle className="mr-2 h-4 w-4" /> Marcar perdido
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Valor</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary">{formatBRL(negocioOriginal.valorCents)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Probabilidade</p>
          <p className="mt-2 font-display text-2xl font-bold">{negocioOriginal.probabilidade}%</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Previsão de fechamento</p>
          <p className="mt-2 font-display text-lg font-bold">
            {new Date(negocioOriginal.previsaoFechamento).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="mt-2">
            <Badge variant={status === "ganho" ? "default" : status === "perdido" ? "destructive" : "secondary"}>
              {status === "aberto" ? "Aberto" : status === "ganho" ? "Ganho" : "Perdido"}
            </Badge>
          </div>
        </div>
      </div>

      {status === "perdido" && motivoPerda && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <strong>Motivo da perda:</strong> {motivoPerda}
        </div>
      )}

      <Panel title="Estágio do funil" className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {funil?.etapas.map((etapa, index) => {
            const alcançada = index <= etapaAtualIndex;
            return (
              <button
                key={etapa.id}
                disabled={status !== "aberto"}
                onClick={() => setEtapaId(etapa.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  alcançada ? "border-transparent bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
                  status !== "aberto" && "cursor-not-allowed opacity-70",
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: etapa.cor }} />
                {etapa.nome}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Estágio atual: <strong>{etapaAtual?.nome}</strong> · Probabilidade sugerida: {etapaAtual?.probabilidade}%
        </p>
      </Panel>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Panel title="Responsável e contato">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" /> Responsável
              </dt>
              <dd className="font-medium">{negocioOriginal.responsavel}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" /> Contato vinculado
              </dt>
              <dd className="font-medium">
                {contato ? (
                  <Link to="/contatos/$id" params={{ id: contato.id }} className="text-primary hover:underline">
                    {contato.nome}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Empresa">
          <p className="text-sm text-muted-foreground">
            {contato ? `${contato.empresa} · ${contato.telefone}` : "Contato não vinculado."}
          </p>
        </Panel>
      </div>

      <Panel title="Produtos do negócio" className="mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {negocioOriginal.itens.map((item, idx) => {
              const produto = getProduto(item.produtoId);
              return (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{produto?.nome ?? "Produto removido"}</TableCell>
                  <TableCell className="text-right">{item.quantidade}</TableCell>
                  <TableCell className="text-right">{formatBRL(item.precoCents)}</TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(item.quantidade * item.precoCents)}</TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">{formatBRL(totalItens)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Histórico de eventos">
          {timeline.length === 0 ? (
            <EmptyState icon={Clock} title="Sem eventos" description="Nenhum evento registrado para este negócio." />
          ) : (
            <ol className="space-y-4 border-l pl-5">
              {timeline.map((evento) => {
                const config = ICONES_LINHA_DO_TEMPO[evento.tipo];
                const Icon = config?.icon ?? Clock;
                return (
                  <li key={evento.id} className="relative">
                    <span className="absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full border bg-card">
                      <Icon className={cn("h-3.5 w-3.5", config?.cor)} />
                    </span>
                    <p className="text-sm font-medium">{evento.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {evento.autor} · {new Date(evento.data).toLocaleString("pt-BR")}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
        <Panel title="Tarefas do negócio">
          {negocioOriginal.tarefas.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Nenhuma tarefa" description="Não há tarefas para este negócio." />
          ) : (
            <ul className="space-y-2">
              {negocioOriginal.tarefas.map((tarefa) => (
                <li key={tarefa.id} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
                  <div>
                    <p className={cn("font-medium", tarefa.concluida && "text-muted-foreground line-through")}>{tarefa.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {tarefa.responsavel} · {new Date(tarefa.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge variant={tarefa.concluida ? "secondary" : "outline"}>
                    {tarefa.concluida ? "Concluída" : "Pendente"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Dialog open={dialogAberto !== null} onOpenChange={(open) => !open && setDialogAberto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAberto === "ganho" ? "Marcar negócio como ganho" : "Marcar negócio como perdido"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{dialogAberto === "ganho" ? "Observação (opcional)" : "Motivo da perda"}</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={dialogAberto === "ganho" ? "Ex.: Cliente fechou pedido maior que o previsto." : "Ex.: Cliente optou por concorrente."}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarDesfecho}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
