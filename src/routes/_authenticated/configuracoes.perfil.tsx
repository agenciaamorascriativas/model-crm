import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageHeader } from "@/components/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { meuPerfilDemo, idiomas, fusosHorarios } from "@/lib/demo/configuracoes";

export const Route = createFileRoute("/_authenticated/configuracoes/perfil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Meu perfil — Amoras CRM" },
      { name: "description", content: "Dados pessoais, foto e preferências da sua conta." },
      { property: "og:title", content: "Meu perfil — Amoras CRM" },
      { property: "og:description", content: "Dados pessoais, foto e preferências da sua conta." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const [nome, setNome] = useState(meuPerfilDemo.nome);
  const [cargo, setCargo] = useState(meuPerfilDemo.cargo);
  const [telefone, setTelefone] = useState(meuPerfilDemo.telefone);
  const [idioma, setIdioma] = useState(meuPerfilDemo.idioma);
  const [fuso, setFuso] = useState(meuPerfilDemo.fuso);
  const [assinatura, setAssinatura] = useState(meuPerfilDemo.assinatura);

  const iniciais = nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" description="Como você aparece para o resto da equipe." demo />

      <Panel title="Foto e identificação">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-secondary text-lg text-secondary-foreground">
              {iniciais}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" onClick={() => toast.success("Foto atualizada (exemplo).")}>
              Trocar foto
            </Button>
            <p className="text-xs text-muted-foreground">PNG ou JPG, até 2 MB.</p>
          </div>
        </div>
      </Panel>

      <Panel title="Dados pessoais">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cargo</Label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Idioma</Label>
            <Select value={idioma} onValueChange={setIdioma}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {idiomas.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Fuso horário</Label>
            <Select value={fuso} onValueChange={setFuso}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {fusosHorarios.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      <Panel title="Assinatura de mensagem" description="Usada ao final de e-mails e notas internas.">
        <Textarea value={assinatura} onChange={(e) => setAssinatura(e.target.value)} rows={4} />
      </Panel>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Perfil salvo (exemplo).")}>Salvar alterações</Button>
      </div>
    </div>
  );
}
