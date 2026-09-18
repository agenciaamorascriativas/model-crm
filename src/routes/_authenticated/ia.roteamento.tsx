import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowUp, ArrowDown, Plus, Route as RouteIcon, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import {
  regrasRoteamento as regrasIniciais,
  agentes,
  type RegraRoteamento,
  type TipoCondicaoRoteamento,
} from "@/lib/demo/ia";

export const Route = createFileRoute("/_authenticated/ia/roteamento")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Roteamento da IA — Amoras CRM" },
      { name: "description", content: "Regras que definem para onde cada conversa é encaminhada." },
      { property: "og:title", content: "Roteamento da IA — Amoras CRM" },
      { property: "og:description", content: "Regras que definem para onde cada conversa é encaminhada." },
    ],
  }),
  component: RoteamentoPage,
});

const LABEL_TIPO: Record<TipoCondicaoRoteamento, string> = {
  palavra_chave: "Palavra-chave",
  etiqueta: "Etiqueta",
  horario: "Horário",
  origem: "Origem",
};

function RoteamentoPage() {
  const [regras, setRegras] = useState<RegraRoteamento[]>(
    [...regrasIniciais].sort((a, b) => a.ordem - b.ordem),
  );
  const [editando, setEditando] = useState<RegraRoteamento | null>(null);
  const [criando, setCriando] = useState(false);
  const [mensagemSimulador, setMensagemSimulador] = useState("");
  const [resultadoSimulador, setResultadoSimulador] = useState<string | null>(null);

  function mover(id: string, direcao: -1 | 1) {
    setRegras((prev) => {
      const lista = [...prev];
      const idx = lista.findIndex((r) => r.id === id);
      const novoIdx = idx + direcao;
      if (novoIdx < 0 || novoIdx >= lista.length) return prev;
      [lista[idx], lista[novoIdx]] = [lista[novoIdx], lista[idx]];
      return lista.map((r, i) => ({ ...r, ordem: i + 1 }));
    });
  }

  function toggleAtiva(id: string) {
    setRegras((prev) => prev.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r)));
    toast.success("Regra atualizada.");
  }

  function salvar(regra: RegraRoteamento) {
    setRegras((prev) => {
      const existe = prev.some((r) => r.id === regra.id);
      const lista = existe
        ? prev.map((r) => (r.id === regra.id ? regra : r))
        : [...prev, { ...regra, ordem: prev.length + 1 }];
      return lista;
    });
    toast.success("Regra salva com sucesso.");
    setEditando(null);
    setCriando(false);
  }

  function simular() {
    if (!mensagemSimulador.trim()) return;
    const texto = mensagemSimulador.toLowerCase();
    const regraCorrespondente = regras
      .filter((r) => r.ativa)
      .find((r) => {
        if (r.tipoCondicao !== "palavra_chave") return false;
        const palavras = r.condicao.match(/"([^"]+)"/g)?.map((p) => p.replace(/"/g, "").toLowerCase()) ?? [];
        return palavras.some((p) => texto.includes(p));
      });
    setResultadoSimulador(
      regraCorrespondente
        ? `Encaminhado para ${regraCorrespondente.destino} pela regra "${regraCorrespondente.condicao}".`
        : "Nenhuma regra por palavra-chave correspondeu. A mensagem seguiria para o agente padrão.",
    );
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Roteamento"
        description="Defina regras para encaminhar conversas para o agente ou equipe certa."
        demo
        actions={
          <Button onClick={() => setCriando(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova regra
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Regras" description="Avaliadas em ordem, de cima para baixo">
          <div className="space-y-3">
            {regras.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={idx === 0}
                    onClick={() => mover(r.id, -1)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={idx === regras.length - 1}
                    onClick={() => mover(r.id, 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <RouteIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    Se <Badge variant="outline" className="mx-1 font-normal">{LABEL_TIPO[r.tipoCondicao]}</Badge>
                    {r.condicao}, então encaminhar para{" "}
                    <span className="font-medium">{r.destino}</span>
                  </p>
                </div>
                <Switch checked={r.ativa} onCheckedChange={() => toggleAtiva(r.id)} />
                <Button variant="outline" size="sm" onClick={() => setEditando(r)}>
                  Editar
                </Button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Simulador" description="Teste uma mensagem contra as regras ativas">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Mensagem do cliente</Label>
              <Input
                value={mensagemSimulador}
                onChange={(e) => setMensagemSimulador(e.target.value)}
                placeholder="Ex.: Quero cancelar meu pedido"
              />
            </div>
            <Button className="w-full" onClick={simular}>
              <PlayCircle className="mr-2 h-4 w-4" /> Simular
            </Button>
            {resultadoSimulador && (
              <div className="rounded-xl border bg-muted/40 p-3 text-sm">{resultadoSimulador}</div>
            )}
          </div>
        </Panel>
      </div>

      {(editando || criando) && (
        <RegraDialog
          regra={editando}
          onClose={() => {
            setEditando(null);
            setCriando(false);
          }}
          onSave={salvar}
        />
      )}
    </PageContainer>
  );
}

function RegraDialog({
  regra,
  onClose,
  onSave,
}: {
  regra: RegraRoteamento | null;
  onClose: () => void;
  onSave: (regra: RegraRoteamento) => void;
}) {
  const [tipoCondicao, setTipoCondicao] = useState<TipoCondicaoRoteamento>(
    regra?.tipoCondicao ?? "palavra_chave",
  );
  const [condicao, setCondicao] = useState(regra?.condicao ?? "");
  const [tipoDestino, setTipoDestino] = useState<"agente" | "equipe">(regra?.tipoDestino ?? "agente");
  const [destino, setDestino] = useState(regra?.destino ?? "");

  function salvar() {
    onSave({
      id: regra?.id ?? `rt-${Date.now()}`,
      ordem: regra?.ordem ?? 0,
      ativa: regra?.ativa ?? true,
      tipoCondicao,
      condicao,
      tipoDestino,
      destino,
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{regra ? "Editar regra" : "Nova regra"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de condição</Label>
            <Select value={tipoCondicao} onValueChange={(v) => setTipoCondicao(v as TipoCondicaoRoteamento)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="palavra_chave">Palavra-chave</SelectItem>
                <SelectItem value="etiqueta">Etiqueta</SelectItem>
                <SelectItem value="horario">Horário</SelectItem>
                <SelectItem value="origem">Origem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Condição</Label>
            <Input
              value={condicao}
              onChange={(e) => setCondicao(e.target.value)}
              placeholder='Ex.: contém "cancelar"'
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Encaminhar para</Label>
              <Select value={tipoDestino} onValueChange={(v) => setTipoDestino(v as "agente" | "equipe")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agente">Agente</SelectItem>
                  <SelectItem value="equipe">Equipe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Destino</Label>
              {tipoDestino === "agente" ? (
                <Select value={destino} onValueChange={setDestino}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentes.map((a) => (
                      <SelectItem key={a.id} value={a.nome}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Nome da equipe" />
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Salvar regra</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
