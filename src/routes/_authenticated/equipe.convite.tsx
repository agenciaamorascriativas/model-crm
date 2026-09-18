import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer, PageHeader, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { cargosPermissoesDemo, convitesPendentesDemo, funisDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/equipe/convite")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Convidar pessoa — Amoras CRM" },
      { name: "description", content: "Convide novas pessoas para a equipe e defina seus acessos." },
      { property: "og:title", content: "Convidar pessoa — Amoras CRM" },
      { property: "og:description", content: "Convide novas pessoas para a equipe e defina seus acessos." },
    ],
  }),
  component: ConvitePage,
});

const canaisDemo = ["WhatsApp", "E-mail", "Chat do site"];

function ConvitePage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("Atendente");
  const [funisSel, setFunisSel] = useState<string[]>(funisDemo.slice(0, 1));
  const [canaisSel, setCanaisSel] = useState<string[]>(canaisDemo.slice(0, 1));
  const [convites, setConvites] = useState(convitesPendentesDemo);

  function enviarConvite(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;
    setConvites((prev) => [
      { id: crypto.randomUUID(), nome, email, cargo, enviadoEm: "agora" },
      ...prev,
    ]);
    toast.success("Convite enviado.");
    setNome("");
    setEmail("");
  }

  return (
    <PageContainer wide>
      <PageHeader title="Convidar pessoa" description="Traga novos membros para a equipe e defina o acesso deles." demo />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel title="Dados do convite">
          <form onSubmit={enviarConvite} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cargosPermissoesDemo.map((c) => (
                    <SelectItem key={c.cargo} value={c.cargo}>{c.cargo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Funis com acesso</Label>
              <div className="space-y-2">
                {funisDemo.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={funisSel.includes(f)}
                      onCheckedChange={(v) =>
                        setFunisSel((prev) => (v ? [...prev, f] : prev.filter((x) => x !== f)))
                      }
                    />
                    {f}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Canais de acesso</Label>
              <div className="space-y-2">
                {canaisDemo.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={canaisSel.includes(c)}
                      onCheckedChange={(v) =>
                        setCanaisSel((prev) => (v ? [...prev, c] : prev.filter((x) => x !== c)))
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Enviar convite
            </Button>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="O que cada cargo pode fazer">
            <div className="space-y-3">
              {cargosPermissoesDemo.map((c) => (
                <div key={c.cargo} className="rounded-xl border p-3">
                  <p className="font-medium">{c.cargo}</p>
                  <p className="text-sm text-muted-foreground">{c.descricao}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Convites pendentes">
            <div className="space-y-2">
              {convites.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.nome}</p>
                    <p className="truncate text-sm text-muted-foreground">{c.email}</p>
                  </div>
                  <Badge variant="secondary">{c.cargo}</Badge>
                  <span className="text-xs text-muted-foreground">{c.enviadoEm}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.success("Convite reenviado (exemplo).")}
                  >
                    Reenviar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setConvites((prev) => prev.filter((x) => x.id !== c.id));
                      toast.success("Convite cancelado.");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ))}
              {convites.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
