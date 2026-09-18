import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer, PageHeader, EmptyState, Panel, formatBRL } from "@/components/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageCircle,
  Plus,
  CalendarClock,
  Phone,
  Mail,
  Building2,
  FileText,
  StickyNote,
  Users,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  UserSearch,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CONTATOS,
  LINHA_DO_TEMPO,
  ARQUIVOS,
  NOTAS,
  NEGOCIOS,
  getContato,
  getFunil,
  type Nota,
} from "@/lib/demo/vendas";

export const Route = createFileRoute("/_authenticated/contatos/$id")({
  ssr: false,
  head: ({ params }) => {
    const contato = getContato(params.id);
    const nome = contato?.nome ?? "Contato não encontrado";
    return {
      meta: [
        { title: `${nome} — Amoras CRM` },
        { name: "description", content: `Ficha do contato ${nome}.` },
        { property: "og:title", content: `${nome} — Amoras CRM` },
        { property: "og:description", content: `Ficha do contato ${nome}.` },
      ],
    };
  },
  component: ContatoFichaPage,
});

const iniciais = (nome: string) =>
  nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ICONES_LINHA_DO_TEMPO: Record<string, { icon: typeof MessageCircle; cor: string }> = {
  mensagem_enviada: { icon: MessageCircle, cor: "text-primary" },
  mensagem_recebida: { icon: MessageCircle, cor: "text-accent-foreground" },
  ligacao: { icon: Phone, cor: "text-chart-2" },
  nota: { icon: StickyNote, cor: "text-chart-4" },
  estagio: { icon: ArrowUpRight, cor: "text-chart-3" },
  reuniao: { icon: CalendarClock, cor: "text-chart-1" },
  tarefa: { icon: CheckCircle2, cor: "text-primary" },
};

function ContatoFichaPage() {
  const { id } = Route.useParams();
  const contato = getContato(id);

  if (!contato) {
    return (
      <PageContainer>
        <PageHeader title="Contato não encontrado" demo />
        <EmptyState
          icon={UserSearch}
          title="Não encontramos esse contato"
          description="Ele pode ter sido removido da base de exemplo. Volte para a lista de contatos e tente novamente."
          action={
            <Button asChild>
              <Link to="/contatos">Voltar para contatos</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const negociosDoContato = NEGOCIOS.filter((n) => n.contatoId === contato.id);
  const timeline = LINHA_DO_TEMPO[contato.id] ?? [];
  const arquivos = ARQUIVOS[contato.id] ?? [];
  const [notas, setNotas] = useState<Nota[]>(NOTAS[contato.id] ?? []);
  const [novaNota, setNovaNota] = useState("");

  const adicionarNota = () => {
    if (!novaNota.trim()) return;
    setNotas((prev) => [
      { id: `nota-${Date.now()}`, conteudo: novaNota.trim(), autor: "Você", data: new Date().toISOString() },
      ...prev,
    ]);
    setNovaNota("");
    toast.success("Nota adicionada.");
  };

  return (
    <PageContainer wide>
      <PageHeader
        title={contato.nome}
        description={`${contato.cargo ? contato.cargo + " · " : ""}${contato.empresa}`}
        demo
        actions={
          <>
            <Button variant="outline" onClick={() => toast("Abrindo conversa de exemplo...")}>
              <MessageCircle className="mr-2 h-4 w-4" /> Abrir conversa
            </Button>
            <Button variant="outline" onClick={() => toast("Agendamento de exemplo criado.")}>
              <CalendarClock className="mr-2 h-4 w-4" /> Agendar
            </Button>
            <Button onClick={() => toast.success("Novo negócio criado a partir do contato.")}>
              <Plus className="mr-2 h-4 w-4" /> Novo negócio
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-base">{iniciais(contato.nome)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {contato.telefone}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> {contato.email}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> {contato.empresa}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {contato.etiquetas.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="visao-geral">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="linha-do-tempo">Linha do tempo</TabsTrigger>
          <TabsTrigger value="negocios">Negócios</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <div className="grid gap-4 md:grid-cols-2">
            <Panel title="Dados do contato">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Responsável</dt>
                  <dd className="font-medium">{contato.responsavel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Telefone</dt>
                  <dd className="font-medium">{contato.telefone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">E-mail</dt>
                  <dd className="font-medium">{contato.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Empresa</dt>
                  <dd className="font-medium">{contato.empresa}</dd>
                </div>
              </dl>
            </Panel>
            <Panel title="Campos personalizados">
              <dl className="space-y-3 text-sm">
                {contato.camposPersonalizados.map((campo) => (
                  <div key={campo.rotulo} className="flex justify-between">
                    <dt className="text-muted-foreground">{campo.rotulo}</dt>
                    <dd className="font-medium">{campo.valor}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="linha-do-tempo">
          <Panel title="Linha do tempo">
            {timeline.length === 0 ? (
              <EmptyState icon={Clock} title="Sem eventos ainda" description="Nenhuma interação registrada para este contato." />
            ) : (
              <ol className="space-y-5 border-l pl-5">
                {timeline.map((evento) => {
                  const config = ICONES_LINHA_DO_TEMPO[evento.tipo];
                  const Icon = config?.icon ?? Clock;
                  return (
                    <li key={evento.id} className="relative">
                      <span className="absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full border bg-card">
                        <Icon className={cn("h-3.5 w-3.5", config?.cor)} />
                      </span>
                      <p className="text-sm font-medium">{evento.titulo}</p>
                      {evento.descricao && <p className="text-sm text-muted-foreground">{evento.descricao}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {evento.autor} · {new Date(evento.data).toLocaleString("pt-BR")}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="negocios">
          <Panel title="Negócios vinculados">
            {negociosDoContato.length === 0 ? (
              <EmptyState icon={Users} title="Nenhum negócio" description="Este contato ainda não possui negócios." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Negócio</TableHead>
                    <TableHead>Estágio</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negociosDoContato.map((negocio) => {
                    const funil = getFunil(negocio.funilId);
                    const etapa = funil?.etapas.find((e) => e.id === negocio.etapaId);
                    return (
                      <TableRow key={negocio.id}>
                        <TableCell>
                          <Link to="/negocios/$id" params={{ id: negocio.id }} className="font-medium text-primary hover:underline">
                            {negocio.titulo}
                          </Link>
                        </TableCell>
                        <TableCell>{etapa?.nome ?? "—"}</TableCell>
                        <TableCell>{formatBRL(negocio.valorCents)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={negocio.status === "ganho" ? "default" : negocio.status === "perdido" ? "destructive" : "secondary"}
                          >
                            {negocio.status === "aberto" ? "Aberto" : negocio.status === "ganho" ? "Ganho" : "Perdido"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="tarefas">
          <Panel title="Tarefas relacionadas">
            {negociosDoContato.flatMap((n) => n.tarefas).length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Nenhuma tarefa" description="Não há tarefas para este contato." />
            ) : (
              <ul className="space-y-2">
                {negociosDoContato.flatMap((n) => n.tarefas).map((tarefa) => (
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
        </TabsContent>

        <TabsContent value="arquivos">
          <Panel title="Arquivos">
            {arquivos.length === 0 ? (
              <EmptyState icon={FileText} title="Nenhum arquivo" description="Nenhum arquivo foi enviado para este contato." />
            ) : (
              <ul className="space-y-2">
                {arquivos.map((arquivo) => (
                  <li key={arquivo.id} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{arquivo.nome}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {arquivo.tamanho} · {arquivo.enviadoPor} · {new Date(arquivo.data).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="notas">
          <Panel title="Notas">
            <div className="mb-4 flex flex-col gap-2">
              <Textarea
                value={novaNota}
                onChange={(e) => setNovaNota(e.target.value)}
                placeholder="Escreva uma nota sobre este contato..."
              />
              <Button className="self-end" onClick={adicionarNota}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar nota
              </Button>
            </div>
            {notas.length === 0 ? (
              <EmptyState icon={StickyNote} title="Nenhuma nota" description="Adicione a primeira nota sobre este contato." />
            ) : (
              <ul className="space-y-3">
                {notas.map((nota) => (
                  <li key={nota.id} className="rounded-xl border bg-muted/30 p-3 text-sm">
                    <p>{nota.conteudo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {nota.autor} · {new Date(nota.data).toLocaleString("pt-BR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
