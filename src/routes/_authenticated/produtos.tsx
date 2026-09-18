import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageContainer, PageHeader, EmptyState, StatCard, formatBRL } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Search, Plus, Pencil, Package, Tag, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PRODUTOS as PRODUTOS_INICIAIS, type Produto } from "@/lib/demo/vendas";

export const Route = createFileRoute("/_authenticated/produtos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Produtos — Amoras CRM" },
      { name: "description", content: "Gerencie o catálogo de produtos e serviços." },
      { property: "og:title", content: "Produtos — Amoras CRM" },
      { property: "og:description", content: "Gerencie o catálogo de produtos e serviços." },
    ],
  }),
  component: ProdutosPage,
});

const RECORRENCIA_LABEL: Record<Produto["recorrencia"], string> = {
  unico: "Pagamento único",
  mensal: "Mensal",
  anual: "Anual",
};

let contadorId = 2000;

function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>(PRODUTOS_INICIAIS);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [dialogAberto, setDialogAberto] = useState<{ modo: "criar" | "editar"; produto?: Produto } | null>(null);

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [categoriaForm, setCategoriaForm] = useState("Cosméticos");
  const [preco, setPreco] = useState("");
  const [recorrencia, setRecorrencia] = useState<Produto["recorrencia"]>("unico");

  const categorias = useMemo(() => Array.from(new Set(produtos.map((p) => p.categoria))), [produtos]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      const combina = !q || [p.nome, p.codigo].some((f) => f.toLowerCase().includes(q));
      const categoriaOk = categoria === "todas" || p.categoria === categoria;
      return combina && categoriaOk;
    });
  }, [produtos, busca, categoria]);

  const ticketMedio = produtos.length
    ? produtos.reduce((s, p) => s + p.precoCents, 0) / produtos.length
    : 0;

  const abrirCriar = () => {
    setNome("");
    setCodigo("");
    setCategoriaForm("Cosméticos");
    setPreco("");
    setRecorrencia("unico");
    setDialogAberto({ modo: "criar" });
  };

  const abrirEditar = (produto: Produto) => {
    setNome(produto.nome);
    setCodigo(produto.codigo);
    setCategoriaForm(produto.categoria);
    setPreco((produto.precoCents / 100).toString());
    setRecorrencia(produto.recorrencia);
    setDialogAberto({ modo: "editar", produto });
  };

  const salvar = () => {
    if (!nome.trim() || !codigo.trim()) return;
    const precoCents = Math.round(Number(preco.replace(",", ".")) * 100) || 0;
    if (dialogAberto?.modo === "criar") {
      const novo: Produto = {
        id: `p-${contadorId++}`,
        nome: nome.trim(),
        codigo: codigo.trim(),
        categoria: categoriaForm.trim(),
        precoCents,
        recorrencia,
        ativo: true,
      };
      setProdutos((prev) => [novo, ...prev]);
      toast.success("Produto criado.");
    } else if (dialogAberto?.produto) {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === dialogAberto.produto!.id
            ? { ...p, nome: nome.trim(), codigo: codigo.trim(), categoria: categoriaForm.trim(), precoCents, recorrencia }
            : p,
        ),
      );
      toast.success("Produto atualizado.");
    }
    setDialogAberto(null);
  };

  const alternarAtivo = (produto: Produto) => {
    setProdutos((prev) => prev.map((p) => (p.id === produto.id ? { ...p, ativo: !p.ativo } : p)));
  };

  return (
    <PageContainer wide>
      <PageHeader
        title="Produtos e serviços"
        description="Catálogo utilizado nos negócios do funil de vendas."
        demo
        actions={
          <Button onClick={abrirCriar}>
            <Plus className="mr-2 h-4 w-4" /> Novo produto
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Total de produtos" value={produtos.length} icon={Package} />
        <StatCard label="Ticket médio" value={formatBRL(ticketMedio)} icon={Wallet} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou código..." className="pl-9" />
        </div>
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Recorrência</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState icon={Tag} title="Nenhum produto encontrado" description="Ajuste os filtros ou cadastre um novo produto." />
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell className="font-medium">{produto.nome}</TableCell>
                <TableCell className="text-muted-foreground">{produto.codigo}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{produto.categoria}</Badge>
                </TableCell>
                <TableCell>{formatBRL(produto.precoCents)}</TableCell>
                <TableCell className="text-muted-foreground">{RECORRENCIA_LABEL[produto.recorrencia]}</TableCell>
                <TableCell>
                  <Switch checked={produto.ativo} onCheckedChange={() => alternarAtivo(produto)} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => abrirEditar(produto)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogAberto !== null} onOpenChange={(open) => !open && setDialogAberto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAberto?.modo === "criar" ? "Novo produto" : "Editar produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Sérum Facial Vitamina C" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: COS-1090" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input value={categoriaForm} onChange={(e) => setCategoriaForm(e.target.value)} placeholder="Ex.: Cosméticos" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="Ex.: 89,90" />
              </div>
              <div className="space-y-2">
                <Label>Recorrência</Label>
                <Select value={recorrencia} onValueChange={(v) => setRecorrencia(v as Produto["recorrencia"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unico">Pagamento único</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(null)}>
              Cancelar
            </Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
