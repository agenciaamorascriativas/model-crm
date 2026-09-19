import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { VariaveisPainel, VariaveisPrevia } from "@/components/variaveis-painel";
import { inserirNaPosicao, paraNumeradas, variaveisInvalidas } from "@/lib/variaveis";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MODELOS_MENSAGEM,
  type CategoriaTemplate,
  type ModeloMensagem,
  type StatusAprovacao,
} from "@/lib/demo/atendimento";

export const Route = createFileRoute("/_authenticated/modelos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Modelos de mensagem — Amoras CRM" },
      { name: "description", content: "Modelos de mensagem do WhatsApp e status de aprovação." },
      { property: "og:title", content: "Modelos de mensagem — Amoras CRM" },
      { property: "og:description", content: "Modelos de mensagem do WhatsApp e status de aprovação." },
    ],
  }),
  component: ModelosPage,
});

const CATEGORIA_LABEL: Record<CategoriaTemplate, string> = {
  utilidade: "Utilidade",
  marketing: "Marketing",
  autenticacao: "Autenticação",
};

const STATUS_LABEL: Record<StatusAprovacao, string> = {
  aprovado: "Aprovado",
  em_analise: "Em análise",
  reprovado: "Reprovado",
};

const STATUS_STYLE: Record<StatusAprovacao, string> = {
  aprovado: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  em_analise: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  reprovado: "bg-destructive/10 text-destructive border-destructive/20",
};

const MODELO_VAZIO = {
  nome: "",
  categoria: "utilidade" as CategoriaTemplate,
  idioma: "Português (BR)",
  corpo: "",
};

function ModelosPage() {
  const [modelos, setModelos] = useState<ModeloMensagem[]>(MODELOS_MENSAGEM);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState(MODELO_VAZIO);

  function criarModelo() {
    if (!form.nome || !form.corpo) {
      toast.error("Preencha o nome e o corpo da mensagem.");
      return;
    }
    setModelos((prev) => [
      ...prev,
      {
        id: `mod-${Date.now()}`,
        status: "em_analise",
        ...form,
      },
    ]);
    toast.success("Modelo enviado para análise");
    setDialogAberto(false);
    setForm(MODELO_VAZIO);
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Modelos de mensagem"
        description="Modelos de WhatsApp com aprovação, categoria e idioma"
        demo
        actions={
          <Button onClick={() => setDialogAberto(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo modelo
          </Button>
        }
      />

      <Panel title="Modelos cadastrados">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prévia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelos.map((modelo) => (
              <TableRow key={modelo.id}>
                <TableCell className="font-medium">{modelo.nome}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {CATEGORIA_LABEL[modelo.categoria]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{modelo.idioma}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-normal", STATUS_STYLE[modelo.status])}>
                    {STATUS_LABEL[modelo.status]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-80 truncate text-sm text-muted-foreground">{modelo.corpo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo modelo de mensagem</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-2 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nome do modelo</Label>
                <Input
                  placeholder="confirmacao_pedido"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select
                    value={form.categoria}
                    onValueChange={(v) => setForm({ ...form, categoria: v as CategoriaTemplate })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utilidade">Utilidade</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="autenticacao">Autenticação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Idioma</Label>
                  <Input value={form.idioma} onChange={(e) => setForm({ ...form, idioma: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Corpo da mensagem</Label>
                <Textarea
                  rows={6}
                  placeholder="Use {{1}}, {{2}} para variáveis"
                  value={form.corpo}
                  onChange={(e) => setForm({ ...form, corpo: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis numeradas, ex.: <code className="font-mono">{"{{1}}"}</code>
                </p>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Prévia ao vivo</Label>
              <div className="flex h-full flex-col justify-end rounded-2xl bg-muted/50 p-4">
                <div className="max-w-xs rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm shadow-sm">
                  {form.corpo ? (
                    <p className="whitespace-pre-wrap">{form.corpo}</p>
                  ) : (
                    <p className="text-muted-foreground">A prévia da mensagem aparece aqui…</p>
                  )}
                  <p className="mt-2 text-right text-[10px] text-muted-foreground">09:41</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={criarModelo}>Enviar para aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
