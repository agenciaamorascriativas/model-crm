import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel, StatCard } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, FileText, Globe, MessagesSquare, Package, Search, Upload, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  fontesConhecimento,
  trechosConhecimento,
  type TipoFonteConhecimento,
  type StatusProcessamento,
} from "@/lib/demo/ia";

export const Route = createFileRoute("/_authenticated/ia/conhecimento")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Base de conhecimento — Amoras CRM" },
      { name: "description", content: "Fontes de conteúdo que alimentam as respostas da IA." },
      { property: "og:title", content: "Base de conhecimento — Amoras CRM" },
      { property: "og:description", content: "Fontes de conteúdo que alimentam as respostas da IA." },
    ],
  }),
  component: ConhecimentoPage,
});

const ICONE_TIPO: Record<TipoFonteConhecimento, typeof FileText> = {
  documento: FileText,
  site: Globe,
  perguntas_respostas: MessagesSquare,
  catalogo: Package,
};

const LABEL_TIPO: Record<TipoFonteConhecimento, string> = {
  documento: "Documento",
  site: "Site",
  perguntas_respostas: "Perguntas e respostas",
  catalogo: "Catálogo",
};

const LABEL_STATUS: Record<StatusProcessamento, string> = {
  processando: "Processando",
  concluido: "Concluído",
  erro: "Erro",
};

function badgeVariante(status: StatusProcessamento) {
  if (status === "concluido") return "default" as const;
  if (status === "erro") return "destructive" as const;
  return "secondary" as const;
}

function ConhecimentoPage() {
  const [adicionando, setAdicionando] = useState(false);
  const [busca, setBusca] = useState("");
  const [buscou, setBuscou] = useState(false);

  const resultados = trechosConhecimento.filter((t) =>
    busca ? t.trecho.toLowerCase().includes(busca.toLowerCase()) : true,
  );

  return (
    <PageContainer wide>
      <PageHeader
        title="Base de conhecimento"
        description="Conteúdos que a IA consulta para responder com precisão."
        demo
        actions={
          <Button onClick={() => setAdicionando(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar fonte
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Fontes cadastradas" value={fontesConhecimento.length} icon={BookOpen} />
        <StatCard
          label="Trechos indexados"
          value={fontesConhecimento.reduce((acc, f) => acc + f.trechos, 0)}
          icon={FileText}
        />
        <StatCard
          label="Fontes com erro"
          value={fontesConhecimento.filter((f) => f.status === "erro").length}
          icon={Globe}
        />
      </div>

      <Panel className="mt-6" title="Fontes">
        <div className="space-y-3">
          {fontesConhecimento.map((f) => {
            const Icone = ICONE_TIPO[f.tipo];
            return (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Icone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{f.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {LABEL_TIPO[f.tipo]} · {f.trechos} trechos · atualizado em{" "}
                      {new Date(f.atualizadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Badge variant={badgeVariante(f.status)}>{LABEL_STATUS[f.status]}</Badge>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="mt-6" title="Buscar nos trechos" description="Veja o que a IA encontraria para uma pergunta">
        <div className="flex gap-2">
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: prazo de entrega"
          />
          <Button onClick={() => setBuscou(true)}>
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </div>

        {buscou && (
          <div className="mt-4 space-y-3">
            {resultados.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum trecho encontrado.</p>
            )}
            {resultados.map((r) => (
              <div key={r.id} className="rounded-xl border p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{r.fonte}</p>
                  <Badge variant="outline" className="font-normal">
                    {r.relevancia}% relevante
                  </Badge>
                </div>
                <p className="text-sm">{r.trecho}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {adicionando && <AdicionarFonteDialog onClose={() => setAdicionando(false)} />}
    </PageContainer>
  );
}

function AdicionarFonteDialog({ onClose }: { onClose: () => void }) {
  function salvar() {
    toast.success("Fonte adicionada. O processamento começa em instantes.");
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar fonte de conhecimento</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="texto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="texto">Texto</TabsTrigger>
            <TabsTrigger value="site">Site</TabsTrigger>
            <TabsTrigger value="arquivo">Arquivo</TabsTrigger>
          </TabsList>
          <TabsContent value="texto" className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome da fonte</Label>
              <Input placeholder="Ex.: Perguntas frequentes — Pagamento" />
            </div>
            <div className="space-y-1.5">
              <Label>Cole o conteúdo</Label>
              <Textarea rows={6} placeholder="Cole aqui o texto que a IA deve aprender" />
            </div>
          </TabsContent>
          <TabsContent value="site" className="space-y-3">
            <div className="space-y-1.5">
              <Label>Endereço do site</Label>
              <Input placeholder="https://www.suaempresa.com.br" />
            </div>
            <p className="text-xs text-muted-foreground">
              A IA vai ler as páginas públicas do site para aprender sobre seu negócio.
            </p>
          </TabsContent>
          <TabsContent value="arquivo" className="space-y-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm">Arraste um arquivo ou clique para enviar</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX ou planilha</p>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Adicionar fonte</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
