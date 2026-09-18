import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, PageContainer, StatCard, Panel, EmptyState } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import { Clock, Inbox, Timer, CheckCircle2, MessageCircle, Instagram, Facebook, Mail, Inbox as InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ATENDENTES,
  CONVERSAS_FILA,
  INDICADORES_FILA,
  type ConversaFila,
  type StatusFila,
} from "@/lib/demo/atendimento";

export const Route = createFileRoute("/_authenticated/fila")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Fila de atendimento — Amoras CRM" },
      { name: "description", content: "Acompanhe e distribua as conversas em espera." },
      { property: "og:title", content: "Fila de atendimento — Amoras CRM" },
      { property: "og:description", content: "Acompanhe e distribua as conversas em espera." },
    ],
  }),
  component: FilaPage,
});

const CANAL_ICON: Record<ConversaFila["canal"], typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  email: Mail,
};

const STATUS_LABEL: Record<StatusFila, string> = {
  aguardando: "Aguardando",
  em_atendimento: "Em atendimento",
  resolvida: "Resolvida",
};

function PrioridadeBadge({ prioridade }: { prioridade: ConversaFila["prioridade"] }) {
  const variants: Record<ConversaFila["prioridade"], string> = {
    alta: "bg-destructive/10 text-destructive border-destructive/20",
    media: "bg-primary/10 text-primary border-primary/20",
    baixa: "bg-muted text-muted-foreground border-transparent",
  };
  const labels: Record<ConversaFila["prioridade"], string> = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };
  return (
    <Badge variant="outline" className={cn("font-normal", variants[prioridade])}>
      {labels[prioridade]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: StatusFila }) {
  const variants: Record<StatusFila, string> = {
    aguardando: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    em_atendimento: "bg-primary/10 text-primary border-primary/20",
    resolvida: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  };
  return (
    <Badge variant="outline" className={cn("font-normal", variants[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function FilaPage() {
  const [conversas, setConversas] = useState<ConversaFila[]>(CONVERSAS_FILA);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("todos");
  const [encaminharAlvo, setEncaminharAlvo] = useState<ConversaFila | null>(null);
  const [atendenteEscolhido, setAtendenteEscolhido] = useState<string>("");

  const responsaveisDisponiveis = useMemo(
    () => Array.from(new Set(conversas.map((c) => c.responsavel).filter(Boolean))) as string[],
    [conversas],
  );

  const conversasFiltradas = conversas.filter((c) => {
    const statusOk = filtroStatus === "todos" || c.status === filtroStatus;
    const responsavelOk =
      filtroResponsavel === "todos" ||
      (filtroResponsavel === "sem_responsavel" ? !c.responsavel : c.responsavel === filtroResponsavel);
    return statusOk && responsavelOk;
  });

  function assumir(conversa: ConversaFila) {
    setConversas((prev) =>
      prev.map((c) =>
        c.id === conversa.id ? { ...c, status: "em_atendimento", responsavel: "Você" } : c,
      ),
    );
    toast.success(`Você assumiu a conversa com ${conversa.contato}`);
  }

  function abrirEncaminhar(conversa: ConversaFila) {
    setEncaminharAlvo(conversa);
    setAtendenteEscolhido("");
  }

  function confirmarEncaminhamento() {
    if (!encaminharAlvo || !atendenteEscolhido) return;
    setConversas((prev) =>
      prev.map((c) =>
        c.id === encaminharAlvo.id
          ? { ...c, status: "em_atendimento", responsavel: atendenteEscolhido }
          : c,
      ),
    );
    toast.success(`Conversa encaminhada para ${atendenteEscolhido}`);
    setEncaminharAlvo(null);
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Fila de atendimento"
        description="Acompanhe conversas em espera e distribua entre a equipe"
        demo
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aguardando" value={INDICADORES_FILA.aguardando} icon={Inbox} />
        <StatCard label="Em atendimento" value={INDICADORES_FILA.emAtendimento} icon={MessageCircle} />
        <StatCard
          label="Tempo médio de espera"
          value={`${INDICADORES_FILA.tempoMedioEsperaMinutos} min`}
          icon={Timer}
        />
        <StatCard label="Resolvidas hoje" value={INDICADORES_FILA.resolvidasHoje} icon={CheckCircle2} />
      </div>

      <Panel
        title="Conversas na fila"
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
                <SelectItem value="em_atendimento">Em atendimento</SelectItem>
                <SelectItem value="resolvida">Resolvida</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os responsáveis</SelectItem>
                <SelectItem value="sem_responsavel">Sem responsável</SelectItem>
                {responsaveisDisponiveis.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {conversasFiltradas.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="Nenhuma conversa encontrada"
            description="Ajuste os filtros para ver outras conversas da fila."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contato</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Último assunto</TableHead>
                <TableHead>Espera</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversasFiltradas.map((conversa) => {
                const CanalIcon = CANAL_ICON[conversa.canal];
                return (
                  <TableRow key={conversa.id}>
                    <TableCell className="font-medium">{conversa.contato}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CanalIcon className="h-4 w-4" />
                        <span className="capitalize">{conversa.canal}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-64 truncate text-sm text-muted-foreground">
                      {conversa.ultimoAssunto}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {conversa.esperaMinutos} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <PrioridadeBadge prioridade={conversa.prioridade} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={conversa.status} />
                    </TableCell>
                    <TableCell className="text-sm">{conversa.responsavel ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {conversa.status !== "resolvida" && !conversa.responsavel && (
                          <Button size="sm" variant="outline" onClick={() => assumir(conversa)}>
                            Assumir
                          </Button>
                        )}
                        {conversa.status !== "resolvida" && (
                          <Button size="sm" variant="ghost" onClick={() => abrirEncaminhar(conversa)}>
                            Encaminhar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Dialog open={!!encaminharAlvo} onOpenChange={(open) => !open && setEncaminharAlvo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encaminhar conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Encaminhar a conversa com <span className="font-medium text-foreground">{encaminharAlvo?.contato}</span>{" "}
              para:
            </p>
            <Select value={atendenteEscolhido} onValueChange={setAtendenteEscolhido}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um atendente" />
              </SelectTrigger>
              <SelectContent>
                {ATENDENTES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEncaminharAlvo(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarEncaminhamento} disabled={!atendenteEscolhido}>
              Encaminhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
