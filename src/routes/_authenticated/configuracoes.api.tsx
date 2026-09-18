import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Copy } from "lucide-react";
import { chavesApiDemo } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/api")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chaves de API — Amoras CRM" },
      { name: "description", content: "Gerencie chaves de acesso à API do sistema." },
      { property: "og:title", content: "Chaves de API — Amoras CRM" },
      { property: "og:description", content: "Gerencie chaves de acesso à API do sistema." },
    ],
  }),
  component: ApiPage,
});

function ApiPage() {
  const [chaves, setChaves] = useState(chavesApiDemo);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [chaveGerada, setChaveGerada] = useState<string | null>(null);

  function criar() {
    if (!nome.trim()) return;
    const gerada = `sk_live_${Math.random().toString(36).slice(2, 10)}`;
    setChaves((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nome,
        prefixo: gerada.slice(0, 12),
        criadaEm: new Date().toLocaleDateString("pt-BR"),
        ultimoUso: "Nunca",
        permissoes: "Leitura",
      },
    ]);
    setChaveGerada(gerada);
  }

  function fechar() {
    setAberto(false);
    setNome("");
    setChaveGerada(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chaves de API"
        description="Permita que sistemas externos acessem seus dados."
        demo
        actions={
          <Button onClick={() => setAberto(true)}>
            <Plus className="mr-2 h-4 w-4" /> Criar chave
          </Button>
        }
      />

      <Panel title={`${chaves.length} chaves criadas`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-normal">Nome</th>
                <th className="px-4 py-2 font-normal">Prefixo</th>
                <th className="px-4 py-2 font-normal">Criada em</th>
                <th className="px-4 py-2 font-normal">Último uso</th>
                <th className="px-4 py-2 font-normal">Permissões</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {chaves.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{c.nome}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.prefixo}…</td>
                  <td className="px-4 py-3">{c.criadaEm}</td>
                  <td className="px-4 py-3">{c.ultimoUso}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{c.permissoes}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setChaves((prev) => prev.filter((x) => x.id !== c.id));
                        toast.success("Chave revogada.");
                      }}
                    >
                      Revogar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={aberto} onOpenChange={(o) => (o ? setAberto(true) : fechar())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{chaveGerada ? "Chave criada" : "Criar chave de API"}</DialogTitle>
          </DialogHeader>
          {!chaveGerada ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome da chave</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Integração planilhas" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Copie agora: esta chave não será mostrada novamente.
              </p>
              <div className="flex items-center gap-2">
                <Input value={chaveGerada} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard?.writeText(chaveGerada);
                    toast.success("Chave copiada.");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            {!chaveGerada ? (
              <>
                <Button variant="outline" onClick={fechar}>Cancelar</Button>
                <Button onClick={criar}>Criar</Button>
              </>
            ) : (
              <Button onClick={fechar}>Concluir</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
