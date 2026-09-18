import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, PageContainer, Panel } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";
import { registrosAuditoria, type RegistroAuditoria } from "@/lib/demo/relatorios";

export const Route = createFileRoute("/_authenticated/auditoria")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Auditoria — Amoras CRM" },
      { name: "description", content: "Registro de ações realizadas no CRM, com busca e filtros." },
      { property: "og:title", content: "Auditoria — Amoras CRM" },
      { property: "og:description", content: "Registro de ações realizadas no CRM, com busca e filtros." },
    ],
  }),
  component: AuditoriaPage,
});

const tipoVariante = {
  criação: "secondary",
  edição: "outline",
  exclusão: "destructive",
  acesso: "secondary",
} as const;

function AuditoriaPage() {
  const [busca, setBusca] = useState("");
  const [pessoa, setPessoa] = useState("todos");
  const [tipo, setTipo] = useState("todos");
  const [selecionado, setSelecionado] = useState<RegistroAuditoria | null>(null);

  const pessoas = useMemo(
    () => Array.from(new Set(registrosAuditoria.map((r) => r.pessoa))),
    [],
  );

  const filtrados = registrosAuditoria.filter((r) => {
    const buscaOk =
      !busca ||
      r.itemAfetado.toLowerCase().includes(busca.toLowerCase()) ||
      r.acao.toLowerCase().includes(busca.toLowerCase());
    const pessoaOk = pessoa === "todos" || r.pessoa === pessoa;
    const tipoOk = tipo === "todos" || r.tipo === tipo;
    return buscaOk && pessoaOk && tipoOk;
  });

  return (
    <PageContainer wide>
      <PageHeader
        title="Auditoria"
        description="Histórico de ações realizadas por pessoas na conta."
        demo
      />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por ação ou item afetado..."
              className="pl-9"
            />
          </div>
          <Select value={pessoa} onValueChange={setPessoa}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pessoa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as pessoas</SelectItem>
              {pessoas.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="criação">Criação</SelectItem>
              <SelectItem value="edição">Edição</SelectItem>
              <SelectItem value="exclusão">Exclusão</SelectItem>
              <SelectItem value="acesso">Acesso</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="todos">
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Qualquer período</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/hora</TableHead>
              <TableHead>Pessoa</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Item afetado</TableHead>
              <TableHead>Origem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((r) => (
              <TableRow
                key={r.id}
                className="cursor-pointer"
                onClick={() => setSelecionado(r)}
              >
                <TableCell className="whitespace-nowrap text-muted-foreground">{r.dataHora}</TableCell>
                <TableCell className="font-medium">{r.pessoa}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={tipoVariante[r.tipo]} className="capitalize">
                      {r.tipo}
                    </Badge>
                    <span>{r.acao}</span>
                  </div>
                </TableCell>
                <TableCell>{r.itemAfetado}</TableCell>
                <TableCell className="text-muted-foreground">{r.origem}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Sheet open={!!selecionado} onOpenChange={(o) => !o && setSelecionado(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selecionado?.acao}</SheetTitle>
            <SheetDescription>
              {selecionado?.pessoa} · {selecionado?.dataHora} · {selecionado?.origem}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm">
              <span className="font-medium">Item afetado:</span> {selecionado?.itemAfetado}
            </p>
            {selecionado?.alteracoes ? (
              <div>
                <p className="mb-2 text-sm font-medium">Campos alterados</p>
                <div className="space-y-2">
                  {selecionado.alteracoes.map((c) => (
                    <div key={c.campo} className="rounded-xl border p-3 text-sm">
                      <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">{c.campo}</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive line-through">
                          {c.antes}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                          {c.depois}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma alteração de campo registrada para esta ação.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
