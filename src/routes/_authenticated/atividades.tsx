import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageContainer, PageHeader, EmptyState } from "@/components/page-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Phone,
  CalendarClock,
  StickyNote,
  ArrowUpRight,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ATIVIDADES, RESPONSAVEIS, getContato, type Atividade } from "@/lib/demo/vendas";

export const Route = createFileRoute("/_authenticated/atividades")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Atividades — Amoras CRM" },
      { name: "description", content: "Acompanhe tudo o que acontece na sua operação de vendas." },
      { property: "og:title", content: "Atividades — Amoras CRM" },
      { property: "og:description", content: "Acompanhe tudo o que acontece na sua operação de vendas." },
    ],
  }),
  component: AtividadesPage,
});

const TIPO_CONFIG: Record<Atividade["tipo"], { label: string; icon: typeof MessageCircle; cor: string; bg: string }> = {
  mensagem_enviada: { label: "Mensagem enviada", icon: MessageCircle, cor: "text-primary", bg: "bg-primary/10" },
  mensagem_recebida: { label: "Mensagem recebida", icon: MessageCircle, cor: "text-accent-foreground", bg: "bg-accent" },
  ligacao: { label: "Ligação", icon: Phone, cor: "text-chart-2", bg: "bg-chart-2/10" },
  reuniao: { label: "Reunião", icon: CalendarClock, cor: "text-chart-1", bg: "bg-chart-1/10" },
  nota: { label: "Nota", icon: StickyNote, cor: "text-chart-4", bg: "bg-chart-4/10" },
  negocio_movido: { label: "Negócio movido", icon: ArrowUpRight, cor: "text-chart-3", bg: "bg-chart-3/10" },
  tarefa_concluida: { label: "Tarefa concluída", icon: CheckCircle2, cor: "text-primary", bg: "bg-primary/10" },
};

const PERIODOS = [
  { valor: "todos", label: "Todo o período" },
  { valor: "7", label: "Últimos 7 dias" },
  { valor: "30", label: "Últimos 30 dias" },
  { valor: "90", label: "Últimos 90 dias" },
];

function formatarDia(data: Date) {
  return data.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function AtividadesPage() {
  const [tipo, setTipo] = useState("todos");
  const [responsavel, setResponsavel] = useState("todos");
  const [periodo, setPeriodo] = useState("todos");

  const dataMaisRecente = useMemo(
    () => ATIVIDADES.reduce((max, a) => (new Date(a.data) > max ? new Date(a.data) : max), new Date(ATIVIDADES[0]?.data ?? Date.now())),
    [],
  );

  const filtradas = useMemo(() => {
    return ATIVIDADES.filter((a) => {
      const tipoOk = tipo === "todos" || a.tipo === tipo;
      const responsavelOk = responsavel === "todos" || a.responsavel === responsavel;
      let periodoOk = true;
      if (periodo !== "todos") {
        const dias = Number(periodo);
        const limite = new Date(dataMaisRecente);
        limite.setDate(limite.getDate() - dias);
        periodoOk = new Date(a.data) >= limite;
      }
      return tipoOk && responsavelOk && periodoOk;
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [tipo, responsavel, periodo, dataMaisRecente]);

  const agrupadas = useMemo(() => {
    const grupos = new Map<string, Atividade[]>();
    filtradas.forEach((a) => {
      const chave = new Date(a.data).toDateString();
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave)!.push(a);
    });
    return Array.from(grupos.entries());
  }, [filtradas]);

  return (
    <PageContainer wide>
      <PageHeader
        title="Atividades"
        description="Linha do tempo de tudo o que acontece com seus contatos e negócios."
        demo
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Tipo de atividade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {Object.entries(TIPO_CONFIG).map(([valor, config]) => (
              <SelectItem key={valor} value={valor}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={responsavel} onValueChange={setResponsavel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os responsáveis</SelectItem>
            {RESPONSAVEIS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {PERIODOS.map((p) => (
              <SelectItem key={p.valor} value={p.valor}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {agrupadas.length === 0 ? (
        <EmptyState icon={ListChecks} title="Nenhuma atividade encontrada" description="Ajuste os filtros para ver mais resultados." />
      ) : (
        <div className="space-y-8">
          {agrupadas.map(([dia, itens]) => (
            <div key={dia}>
              <p className="mb-3 text-sm font-semibold capitalize text-muted-foreground">{formatarDia(new Date(dia))}</p>
              <ol className="space-y-4 border-l pl-5">
                {itens.map((atividade) => {
                  const config = TIPO_CONFIG[atividade.tipo];
                  const Icon = config.icon;
                  const contato = atividade.contatoId ? getContato(atividade.contatoId) : undefined;
                  return (
                    <li key={atividade.id} className="relative">
                      <span className={cn("absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full border bg-card", config.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", config.cor)} />
                      </span>
                      <div className="rounded-xl border bg-card p-3 shadow-sm">
                        <p className="text-sm font-medium">{atividade.titulo}</p>
                        {atividade.descricao && <p className="text-sm text-muted-foreground">{atividade.descricao}</p>}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{atividade.responsavel}</span>
                          <span>·</span>
                          <span>{new Date(atividade.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          {contato && (
                            <>
                              <span>·</span>
                              <Link to="/contatos/$id" params={{ id: contato.id }} className="text-primary hover:underline">
                                {contato.nome}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
