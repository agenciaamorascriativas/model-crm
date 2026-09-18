import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, PageContainer, Panel, EmptyState, formatBRL } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { History, Bot, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { EXECUCOES, AGENTES_FILTRO, type Execucao, type ResultadoExecucao } from "@/lib/demo/ia-operacao";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ia/execucoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Execuções — Amoras CRM" },
      { name: "description", content: "Histórico do que a IA fez em cada conversa e tarefa." },
      { property: "og:title", content: "Execuções — Amoras CRM" },
      { property: "og:description", content: "Histórico do que a IA fez em cada conversa e tarefa." },
    ],
  }),
  component: ExecucoesPage,
});

const RESULTADO_LABEL: Record<ResultadoExecucao, string> = {
  sucesso: "Sucesso",
  parcial: "Parcial",
  falhou: "Falhou",
};

const RESULTADO_ICON: Record<ResultadoExecucao, typeof CheckCircle2> = {
  sucesso: CheckCircle2,
  parcial: AlertTriangle,
  falhou: XCircle,
};

const RESULTADO_VARIANT: Record<ResultadoExecucao, "default" | "secondary" | "destructive"> = {
  sucesso: "default",
  parcial: "secondary",
  falhou: "destructive",
};

const PERIODOS = [
  { valor: "todos", rotulo: "Qualquer período" },
  { valor: "hoje", rotulo: "Hoje" },
  { valor: "semana", rotulo: "Últimos 7 dias" },
];

function ExecucoesPage() {
  const [agente, setAgente] = useState("todos");
  const [resultado, setResultado] = useState("todos");
  const [periodo, setPeriodo] = useState("todos");
  const [selecionada, setSelecionada] = useState<Execucao | null>(null);

  const filtradas = useMemo(() => {
    return EXECUCOES.filter((e) => {
      if (agente !== "todos" && e.agente !== agente) return false;
      if (resultado !== "todos" && e.resultado !== resultado) return false;
      if (periodo === "hoje" && !e.data.startsWith("2024-05-30")) return false;
      return true;
    });
  }, [agente, resultado, periodo]);

  return (
    <PageContainer wide>
      <PageHeader
        title="Execuções"
        description="Histórico técnico-amigável de tudo que a IA executou em nome da equipe."
        demo
      />

      <Panel
        title="Filtros"
        className="mb-6"
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={agente} onValueChange={setAgente}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os agentes</SelectItem>
                {AGENTES_FILTRO.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resultado} onValueChange={setResultado}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os resultados</SelectItem>
                <SelectItem value="sucesso">Sucesso</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="falhou">Falhou</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {PERIODOS.map((p) => (
                  <SelectItem key={p.valor} value={p.valor}>
                    {p.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <div />
      </Panel>

      <Panel title="Histórico de execuções" description={`${filtradas.length} registro(s)`}>
        {filtradas.length === 0 ? (
          <EmptyState title="Nenhuma execução encontrada" icon={History} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((e) => {
                const Icon = RESULTADO_ICON[e.resultado];
                return (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelecionada(e)}>
                    <TableCell className="text-sm text-muted-foreground">{e.data}</TableCell>
                    <TableCell className="flex items-center gap-1.5 font-medium">
                      <Bot className="h-3.5 w-3.5 text-muted-foreground" /> {e.agente}
                    </TableCell>
                    <TableCell>{e.contato}</TableCell>
                    <TableCell className="text-sm">{e.acao}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.duracaoSegundos}s</TableCell>
                    <TableCell>
                      <Badge variant={RESULTADO_VARIANT[e.resultado]} className="gap-1">
                        <Icon className="h-3 w-3" /> {RESULTADO_LABEL[e.resultado]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatBRL(e.custoEstimadoCentavos)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Sheet open={!!selecionada} onOpenChange={(open) => !open && setSelecionada(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selecionada && (
            <>
              <SheetHeader>
                <SheetTitle>{selecionada.acao}</SheetTitle>
                <SheetDescription>
                  {selecionada.agente} • {selecionada.contato} • {selecionada.data}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold">Passos da execução</h3>
                  <div className="space-y-2">
                    {selecionada.passos.map((p, idx) => (
                      <div key={idx} className="rounded-xl border p-3 text-sm">
                        <p className="font-medium">{p.titulo}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.detalhe}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold">Mensagens trocadas</h3>
                  <div className="space-y-2">
                    {selecionada.mensagens.map((m, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                          m.autor === "cliente" && "bg-muted",
                          m.autor === "ia" && "ml-auto bg-primary text-primary-foreground",
                          m.autor === "sistema" && "mx-auto bg-secondary text-center text-xs",
                        )}
                      >
                        <p>{m.texto}</p>
                        <p className="mt-1 text-[10px] opacity-70">{m.hora}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
