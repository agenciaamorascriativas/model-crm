import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ImagePlus, LayoutDashboard, MessageCircle, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes/marca")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Marca — Amoras CRM" },
      { name: "description", content: "Nome, logo, ícone e cores exibidos no sistema." },
      { property: "og:title", content: "Marca — Amoras CRM" },
      { property: "og:description", content: "Nome, logo, ícone e cores exibidos no sistema." },
    ],
  }),
  component: MarcaPage,
});

function normalizeHex(value: string) {
  const clean = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return `#${clean.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(clean)) return `#${clean.split("").map((c) => c + c).join("").toUpperCase()}`;
  return null;
}

function mix(hex: string, target: number, amount: number) {
  const valid = normalizeHex(hex) ?? "#A52C64";
  const rgb = [1, 3, 5].map((i) => Number.parseInt(valid.slice(i, i + 2), 16));
  return `#${rgb.map((channel) => Math.round(channel + (target - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
}

function MarcaPage() {
  const [nome, setNome] = useState("Amoras CRM");
  const [corTexto, setCorTexto] = useState("#A52C64");
  const [cor, setCor] = useState("#A52C64");
  const [logo, setLogo] = useState<string | null>(null);
  const [icone, setIcone] = useState<string | null>(null);
  const escala = useMemo(() => [0.86, 0.7, 0.5, 0.28, 0, 0.16, 0.32, 0.5, 0.68].map((amount, index) => index < 4 ? mix(cor, 255, amount) : index === 4 ? cor : mix(cor, 0, amount)), [cor]);

  useEffect(() => () => {
    if (logo) URL.revokeObjectURL(logo);
    if (icone) URL.revokeObjectURL(icone);
  }, [logo, icone]);

  function applyTextColor(value: string) {
    setCorTexto(value);
    const valid = normalizeHex(value);
    if (valid) setCor(valid);
  }

  function chooseFile(file: File | undefined, setter: (value: string | null) => void) {
    if (!file) return;
    setter(URL.createObjectURL(file));
  }

  return <div className="space-y-6">
    <PageHeader title="Marca" description="Defina como sua empresa aparece para toda a equipe." demo />

    <Panel title="Como sua empresa aparece">
      <div className="max-w-3xl space-y-7">
        <div className="space-y-1.5">
          <Label htmlFor="brand-name">Nome da empresa</Label>
          <Input id="brand-name" value={nome} onChange={(event) => setNome(event.target.value)} />
          <p className="text-xs text-muted-foreground">Este nome aparece no menu e nas telas de acesso.</p>
        </div>

        <div className="space-y-3">
          <Label>Cor da marca</Label>
          <div className="flex items-center gap-3">
            <Input aria-label="Selecionar cor" type="color" value={cor} onChange={(event) => { setCor(event.target.value.toUpperCase()); setCorTexto(event.target.value.toUpperCase()); }} className="h-11 w-16 cursor-pointer p-1" />
            <Input aria-label="Código hexadecimal" value={corTexto} onChange={(event) => applyTextColor(event.target.value)} className="w-36 font-mono uppercase" />
          </div>
          {!normalizeHex(corTexto) && <p className="text-xs text-destructive">Digite uma cor hexadecimal válida, como #A52C64.</p>}
          <div className="grid h-14 grid-cols-9 overflow-hidden rounded-lg border" aria-label="Escala de cores gerada">
            {escala.map((shade, index) => <div key={`${shade}-${index}`} style={{ backgroundColor: shade }} title={shade} />)}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ backgroundColor: cor }} />Sua cor · {cor}</span>
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ backgroundColor: escala[3] }} />Botões no modo claro</span>
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ backgroundColor: escala[5] }} />Botões no modo escuro</span>
          </div>
        </div>

        <AssetField label="Logo" hint="PNG ou JPG, até 2 MB. Prefira fundo transparente." value={logo} onChange={(file) => chooseFile(file, setLogo)} onRemove={() => setLogo(null)} />
        <AssetField label="Ícone do navegador" hint="PNG ou ICO, em formato quadrado." value={icone} onChange={(file) => chooseFile(file, setIcone)} onRemove={() => setIcone(null)} compact />
      </div>
    </Panel>

    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Prévia — acesso">
        <div className="grid min-h-64 place-items-center rounded-lg border bg-muted/30 p-6">
          <div className="w-full max-w-64 space-y-3 text-center">
            {logo ? <img src={logo} alt="Prévia do logo" className="mx-auto max-h-12 max-w-48 object-contain" /> : <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg text-primary-foreground" style={{ backgroundColor: cor }}><ImagePlus className="h-5 w-5" /></div>}
            <p className="font-display font-semibold">{nome || "Nome da empresa"}</p>
            <div className="h-9 rounded-md border bg-card" />
            <div className="grid h-9 place-items-center rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundColor: cor }}>Entrar</div>
          </div>
        </div>
      </Panel>
      <Panel title="Prévia — menu e controles">
        <div className="grid min-h-64 grid-cols-2 overflow-hidden rounded-lg border">
          <div className="flex flex-col bg-card p-4">
            <PreviewBrand nome={nome} logo={logo} cor={cor} />
            <PreviewNavigation cor={cor} />
          </div>
          <div className="flex flex-col bg-sidebar p-4 text-sidebar-foreground">
            <PreviewBrand nome={nome} logo={logo} cor={escala[2] ?? cor} dark />
            <PreviewNavigation cor={escala[2] ?? cor} dark />
          </div>
        </div>
      </Panel>
    </div>
    <div className="flex justify-end"><Button onClick={() => toast.success("Identidade visual salva (exemplo).")}>Salvar alterações</Button></div>
  </div>;
}

function AssetField({ label, hint, value, onChange, onRemove, compact = false }: { label: string; hint: string; value: string | null; onChange: (file: File | undefined) => void; onRemove: () => void; compact?: boolean }) {
  return <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex flex-wrap items-center gap-3">
      <Input type="file" accept="image/png,image/jpeg,image/x-icon" onChange={(event) => onChange(event.target.files?.[0])} className="max-w-sm" />
      {value && <Button type="button" variant="outline" size="sm" onClick={onRemove}><X className="mr-2 h-4 w-4" />Remover</Button>}
    </div>
    <p className="text-xs text-muted-foreground">{hint}</p>
    {value && <div className={compact ? "grid h-20 w-20 place-items-center rounded-lg border bg-muted/30 p-3" : "grid h-28 max-w-md place-items-center rounded-lg border bg-muted/30 p-4"}><img src={value} alt={`Prévia de ${label.toLowerCase()}`} className="max-h-full max-w-full object-contain" /></div>}
  </div>;
}

function PreviewBrand({ nome, logo, cor, dark = false }: { nome: string; logo: string | null; cor: string; dark?: boolean }) {
  return <div className="flex min-w-0 items-center gap-2 border-b pb-4" style={{ borderColor: cor }}>
    {logo ? <img src={logo} alt="" className="h-7 w-7 shrink-0 object-contain" /> : <span className="h-7 w-7 shrink-0 rounded-md" style={{ backgroundColor: cor }} />}
    <span className={dark ? "truncate text-sm font-semibold text-sidebar-foreground" : "truncate text-sm font-semibold"}>{nome || "Empresa"}</span>
  </div>;
}

function PreviewNavigation({ cor, dark = false }: { cor: string; dark?: boolean }) {
  return <div className="mt-5 space-y-3">
    <div className="flex items-center gap-2 text-xs"><LayoutDashboard className="h-4 w-4" /><span>Painel</span></div>
    <div className="flex items-center gap-2 rounded-md p-2 text-xs" style={{ backgroundColor: cor, color: dark ? "var(--sidebar)" : "var(--primary-foreground)" }}><MessageCircle className="h-4 w-4" /><span>WhatsApp</span></div>
    <div className={dark ? "h-8 rounded-md border border-sidebar-border" : "h-8 rounded-md border"} />
  </div>;
}