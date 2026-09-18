import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes/distribuicao")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Distribuição de atendimento — Amoras CRM" },
    { name: "description", content: "Defina quem recebe novos clientes e o que cada atendente enxerga." },
    { property: "og:title", content: "Distribuição de atendimento — Amoras CRM" },
    { property: "og:description", content: "Defina quem recebe novos clientes e o que cada atendente enxerga." },
  ]}),
  component: DistribuicaoPage,
});

const recebimento = [
  { value: "livre", title: "Cada um pega o que quiser", description: "Todo cliente novo cai numa fila aberta e o primeiro atendente que clicar assume." },
  { value: "rodizio", title: "Rodízio automático entre os atendentes", description: "O sistema entrega cada novo cliente ao próximo atendente disponível, em ordem." },
];
const visibilidade = [
  { value: "todos", title: "Todos veem tudo", description: "Qualquer atendente abre conversas e negócios de toda a equipe." },
  { value: "proprios-fila", title: "Os seus, mais os que ainda não têm dono", description: "O atendente vê sua carteira e a fila de clientes ainda não atribuídos." },
  { value: "proprios", title: "Só os seus", description: "O atendente vê apenas o que foi direcionado a ele." },
];

function OptionGroup({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: typeof recebimento }) {
  return <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
    {options.map((option) => <label key={option.value} className={cn("grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border p-4 transition-colors", value === option.value ? "border-primary bg-secondary/50" : "hover:bg-muted/50")}>
      <RadioGroupItem value={option.value} className="mt-0.5" />
      <span className="min-w-0"><span className="block text-sm font-medium">{option.title}</span><span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{option.description}</span></span>
    </label>)}
  </RadioGroup>;
}

function DistribuicaoPage() {
  const [recebe, setRecebe] = useState("livre");
  const [enxerga, setEnxerga] = useState("proprios-fila");
  return <div className="max-w-3xl space-y-6">
    <PageHeader title="Distribuição de atendimento" description="Defina quem recebe cada cliente novo e o que cada atendente enxerga." demo />
    <Panel title="Quem recebe o cliente novo" description="Vale para conversas que chegam sem responsável."><OptionGroup value={recebe} onChange={setRecebe} options={recebimento} /></Panel>
    <Panel title="O que cada atendente enxerga" description="Gerentes e administradores continuam vendo a operação inteira."><OptionGroup value={enxerga} onChange={setEnxerga} options={visibilidade} /></Panel>
    <Button onClick={() => toast.success("Distribuição salva (exemplo).")}>Salvar</Button>
  </div>;
}