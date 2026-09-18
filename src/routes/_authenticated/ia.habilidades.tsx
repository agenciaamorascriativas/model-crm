import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wrench, CalendarCheck, HandCoins, FileText, BookOpen, UserCog, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  habilidades as habilidadesIniciais,
  agentes,
  type Habilidade,
  type CategoriaHabilidade,
} from "@/lib/demo/ia";

export const Route = createFileRoute("/_authenticated/ia/habilidades")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Habilidades da IA — Amoras CRM" },
      { name: "description", content: "Catálogo de ações que os agentes de IA podem executar." },
      { property: "og:title", content: "Habilidades da IA — Amoras CRM" },
      { property: "og:description", content: "Catálogo de ações que os agentes de IA podem executar." },
    ],
  }),
  component: HabilidadesPage,
});

const ICONE_CATEGORIA: Record<CategoriaHabilidade, typeof Wrench> = {
  agenda: CalendarCheck,
  vendas: HandCoins,
  conhecimento: BookOpen,
  atendimento: UserCog,
  contatos: Tag,
};

const LABEL_CATEGORIA: Record<CategoriaHabilidade, string> = {
  agenda: "Agenda",
  vendas: "Vendas",
  conhecimento: "Conhecimento",
  atendimento: "Atendimento",
  contatos: "Contatos",
};

function HabilidadesPage() {
  const [habilidades, setHabilidades] = useState<Habilidade[]>(habilidadesIniciais);
  const [detalhe, setDetalhe] = useState<Habilidade | null>(null);

  function toggleAtiva(id: string) {
    setHabilidades((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ativa: !h.ativa } : h)),
    );
    toast.success("Disponibilidade da habilidade atualizada.");
  }

  return (
    <PageContainer wide>
      <PageHeader
        title="Habilidades"
        description="Ações que os agentes de IA podem executar durante uma conversa."
        demo
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {habilidades.map((h) => {
          const Icone = ICONE_CATEGORIA[h.categoria];
          const agentesQueUsam = agentes.filter((a) => h.agentesQueUsam.includes(a.id));
          return (
            <Panel key={h.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{h.nome}</p>
                    <Badge variant="outline" className="mt-1 font-normal">
                      {LABEL_CATEGORIA[h.categoria]}
                    </Badge>
                  </div>
                </div>
                <Switch checked={h.ativa} onCheckedChange={() => toggleAtiva(h.id)} />
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{h.descricao}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {agentesQueUsam.map((a) => (
                  <Badge key={a.id} variant="secondary" className="font-normal">
                    {a.nome}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setDetalhe(h)}>
                  Ver detalhes
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="max-w-md">
          {detalhe && (
            <>
              <DialogHeader>
                <DialogTitle>{detalhe.nome}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{detalhe.descricao}</p>
                <div>
                  <p className="mb-1.5 text-sm font-medium">Parâmetros</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detalhe.parametros.map((p) => (
                      <Badge key={p} variant="outline" className="font-normal">
                        <FileText className="mr-1 h-3 w-3" /> {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium">Agentes que usam</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agentes
                      .filter((a) => detalhe.agentesQueUsam.includes(a.id))
                      .map((a) => (
                        <Badge key={a.id} variant="secondary" className="font-normal">
                          {a.nome}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
