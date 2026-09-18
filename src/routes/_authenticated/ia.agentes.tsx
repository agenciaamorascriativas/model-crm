import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bot, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import {
  agentes as agentesIniciais,
  habilidades,
  PAPEL_LABEL,
  CANAL_LABEL,
  type Agente,
  type PapelAgente,
  type CanalAgente,
} from "@/lib/demo/ia";

export const Route = createFileRoute("/_authenticated/ia/agentes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Agentes de IA — Amoras CRM" },
      { name: "description", content: "Configure os agentes de inteligência artificial do atendimento." },
      { property: "og:title", content: "Agentes de IA — Amoras CRM" },
      { property: "og:description", content: "Configure os agentes de inteligência artificial do atendimento." },
    ],
  }),
  component: AgentesPage,
});

function habilidadesDoAgente(agente: Agente) {
  return habilidades.filter((h) => agente.habilidades.includes(h.id));
}

function AgentesPage() {
  const [agentes, setAgentes] = useState<Agente[]>(agentesIniciais);
  const [editando, setEditando] = useState<Agente | null>(null);
  const [criando, setCriando] = useState(false);

  function toggleStatus(id: string) {
    setAgentes((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "ativo" ? "pausado" : "ativo" } : a,
      ),
    );
    toast.success("Status do agente atualizado.");
  }

  function salvarAgente(agente: Agente) {
    setAgentes((prev) => {
      const existe = prev.some((a) => a.id === agente.id);
      return existe ? prev.map((a) => (a.id === agente.id ? agente : a)) : [...prev, agente];
    });
    toast.success("Agente salvo com sucesso.");
    setEditando(null);
    setCriando(false);
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Agentes de IA"
        description="Cada agente representa um papel dentro do atendimento automático."
        demo
        actions={
          <Button onClick={() => setCriando(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo agente
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {agentes.map((a) => (
          <Panel key={a.id} className="h-full">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold">{a.nome}</p>
                  <p className="text-sm text-muted-foreground">{PAPEL_LABEL[a.papel]}</p>
                </div>
              </div>
              <Switch checked={a.status === "ativo"} onCheckedChange={() => toggleStatus(a.id)} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">{CANAL_LABEL[a.canal]}</Badge>
              <Badge variant="outline">{a.modelo}</Badge>
              <Badge variant="secondary">{a.conversas} conversas</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {habilidadesDoAgente(a).map((h) => (
                <Badge key={h.id} variant="secondary" className="font-normal">
                  {h.nome}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setEditando(a)}>
                Editar
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      {(editando || criando) && (
        <AgenteDialog
          agente={editando}
          onClose={() => {
            setEditando(null);
            setCriando(false);
          }}
          onSave={salvarAgente}
        />
      )}
    </PageContainer>
  );
}

function AgenteDialog({
  agente,
  onClose,
  onSave,
}: {
  agente: Agente | null;
  onClose: () => void;
  onSave: (agente: Agente) => void;
}) {
  const [nome, setNome] = useState(agente?.nome ?? "");
  const [papel, setPapel] = useState<PapelAgente>(agente?.papel ?? "atendimento");
  const [canal, setCanal] = useState<CanalAgente>(agente?.canal ?? "whatsapp");
  const [tomDeVoz, setTomDeVoz] = useState(agente?.tomDeVoz ?? "");
  const [instrucoes, setInstrucoes] = useState(agente?.instrucoes ?? "");
  const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState<string[]>(
    agente?.habilidades ?? [],
  );
  const [horarioInicio, setHorarioInicio] = useState(agente?.horarioInicio ?? "08:00");
  const [horarioFim, setHorarioFim] = useState(agente?.horarioFim ?? "18:00");
  const [transferirQuando, setTransferirQuando] = useState(agente?.transferirQuando ?? "");
  const [mensagemTeste, setMensagemTeste] = useState("");
  const [respostaTeste, setRespostaTeste] = useState<string | null>(null);

  function toggleHabilidade(id: string) {
    setHabilidadesSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  }

  function testar() {
    if (!mensagemTeste.trim()) return;
    setRespostaTeste(
      `Olá! Aqui é a ${nome || "IA"}. Sobre "${mensagemTeste}", posso te ajudar com isso agora mesmo — em um cenário real eu usaria as habilidades vinculadas para responder com precisão.`,
    );
  }

  function salvar() {
    onSave({
      id: agente?.id ?? `ag-${Date.now()}`,
      nome: nome || "Novo agente",
      papel,
      canal,
      status: agente?.status ?? "ativo",
      modelo: agente?.modelo ?? "GPT-4o mini",
      tomDeVoz,
      instrucoes,
      habilidades: habilidadesSelecionadas,
      conversas: agente?.conversas ?? 0,
      horarioInicio,
      horarioFim,
      transferirQuando,
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{agente ? "Editar agente" : "Novo agente"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="identidade">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="identidade">Identidade</TabsTrigger>
            <TabsTrigger value="instrucoes">Instruções</TabsTrigger>
            <TabsTrigger value="habilidades">Habilidades</TabsTrigger>
            <TabsTrigger value="limites">Limites</TabsTrigger>
            <TabsTrigger value="teste">Teste</TabsTrigger>
          </TabsList>

          <TabsContent value="identidade" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome do agente</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Amora" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Papel</Label>
                <Select value={papel} onValueChange={(v) => setPapel(v as PapelAgente)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="qualificacao">Qualificação</SelectItem>
                    <SelectItem value="agendamento">Agendamento</SelectItem>
                    <SelectItem value="pos_venda">Pós-venda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Canal</Label>
                <Select value={canal} onValueChange={(v) => setCanal(v as CanalAgente)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="todos">Todos os canais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tom de voz</Label>
              <Input
                value={tomDeVoz}
                onChange={(e) => setTomDeVoz(e.target.value)}
                placeholder="Ex.: Amigável e objetivo"
              />
            </div>
          </TabsContent>

          <TabsContent value="instrucoes" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Instruções (prompt)</Label>
              <Textarea
                value={instrucoes}
                onChange={(e) => setInstrucoes(e.target.value)}
                rows={10}
                placeholder="Descreva como o agente deve se comportar..."
              />
            </div>
          </TabsContent>

          <TabsContent value="habilidades" className="space-y-3">
            {habilidades.map((h) => (
              <label key={h.id} className="flex items-start gap-3 rounded-xl border p-3">
                <Checkbox
                  checked={habilidadesSelecionadas.includes(h.id)}
                  onCheckedChange={() => toggleHabilidade(h.id)}
                />
                <div>
                  <p className="text-sm font-medium">{h.nome}</p>
                  <p className="text-xs text-muted-foreground">{h.descricao}</p>
                </div>
              </label>
            ))}
          </TabsContent>

          <TabsContent value="limites" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Início do atendimento</Label>
                <Input type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim do atendimento</Label>
                <Input type="time" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Quando transferir para humano</Label>
              <Textarea
                value={transferirQuando}
                onChange={(e) => setTransferirQuando(e.target.value)}
                rows={3}
                placeholder="Ex.: Cliente pedir para falar com humano"
              />
            </div>
          </TabsContent>

          <TabsContent value="teste" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mensagem de teste</Label>
              <div className="flex gap-2">
                <Input
                  value={mensagemTeste}
                  onChange={(e) => setMensagemTeste(e.target.value)}
                  placeholder="Digite uma mensagem como se fosse o cliente"
                />
                <Button type="button" onClick={testar}>
                  <Send className="mr-2 h-4 w-4" /> Testar
                </Button>
              </div>
            </div>
            {respostaTeste && (
              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" /> Prévia da resposta simulada
                </div>
                <p className="text-sm">{respostaTeste}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Salvar agente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
