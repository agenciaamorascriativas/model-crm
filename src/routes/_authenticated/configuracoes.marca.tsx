import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { applyBrandColor, getBrandAsset, getBrandSettings, shade } from "@/lib/brand";
import { toast } from "sonner";
import { ImagePlus, LayoutDashboard, Loader2, MessageCircle, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracoes/marca")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Marca — Amoras CRM" },
    { name: "description", content: "Nome, logo, ícone e cores exibidos no sistema." },
    { property: "og:title", content: "Marca — Amoras CRM" },
    { property: "og:description", content: "Nome, logo, ícone e cores exibidos no sistema." },
  ] }),
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
  const queryClient = useQueryClient();
  const user = Route.useRouteContext().user;
  const { data: settings } = useQuery({ queryKey: ["app_settings", "brand"], queryFn: getBrandSettings });
  const { data: savedLogo } = useQuery({ queryKey: ["brand-asset", settings?.logo_url], queryFn: () => getBrandAsset(settings?.logo_url ?? null), enabled: Boolean(settings?.logo_url) });
  const { data: savedIcon } = useQuery({ queryKey: ["brand-asset", settings?.favicon_url], queryFn: () => getBrandAsset(settings?.favicon_url ?? null), enabled: Boolean(settings?.favicon_url) });
  const { data: isAdmin } = useQuery({
    queryKey: ["my-role", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (error) throw error;
      return data.some((item) => item.role === "admin");
    },
  });
  const [nome, setNome] = useState("");
  const [corTexto, setCorTexto] = useState("#A52C64");
  const [cor, setCor] = useState("#A52C64");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [iconRemoved, setIconRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const logoPreview = useMemo(() => logoFile ? URL.createObjectURL(logoFile) : logoRemoved ? null : savedLogo ?? null, [logoFile, logoRemoved, savedLogo]);
  const iconPreview = useMemo(() => iconFile ? URL.createObjectURL(iconFile) : iconRemoved ? null : savedIcon ?? null, [iconFile, iconRemoved, savedIcon]);
  const escala = useMemo(() => [0.86, 0.7, 0.5, 0.28, 0, 0.16, 0.32, 0.5, 0.68].map((amount, index) => index < 4 ? mix(cor, 255, amount) : index === 4 ? cor : mix(cor, 0, amount)), [cor]);

  useEffect(() => {
    if (!settings) return;
    setNome(settings.brand_name);
    setCor(settings.primary_color);
    setCorTexto(settings.primary_color);
  }, [settings]);
  useEffect(() => () => { if (logoFile && logoPreview) URL.revokeObjectURL(logoPreview); }, [logoFile, logoPreview]);
  useEffect(() => () => { if (iconFile && iconPreview) URL.revokeObjectURL(iconPreview); }, [iconFile, iconPreview]);

  function chooseFile(file: File | undefined, kind: "logo" | "icon") {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Escolha uma imagem de até 2 MB."); return; }
    if (!file.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem."); return; }
    if (kind === "logo") { setLogoFile(file); setLogoRemoved(false); }
    else { setIconFile(file); setIconRemoved(false); }
  }

  async function upload(file: File, prefix: string) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${prefix}.${extension}`;
    const { error } = await supabase.storage.from("brand-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    return path;
  }

  async function save() {
    const validColor = normalizeHex(corTexto);
    if (!nome.trim()) { toast.error("Digite o nome da empresa."); return; }
    if (!validColor) { toast.error("Digite uma cor hexadecimal válida."); return; }
    setSaving(true);
    try {
      let logoPath = settings?.logo_url ?? null;
      let iconPath = settings?.favicon_url ?? null;
      if (logoRemoved && logoPath) { await supabase.storage.from("brand-assets").remove([logoPath]); logoPath = null; }
      if (iconRemoved && iconPath) { await supabase.storage.from("brand-assets").remove([iconPath]); iconPath = null; }
      if (logoFile) logoPath = await upload(logoFile, "logo");
      if (iconFile) iconPath = await upload(iconFile, "favicon");
      const { error } = await supabase.from("app_settings").update({ brand_name: nome.trim(), primary_color: validColor, logo_url: logoPath, favicon_url: iconPath }).eq("id", 1);
      if (error) throw error;
      applyBrandColor(validColor);
      await queryClient.invalidateQueries({ queryKey: ["app_settings"] });
      await queryClient.invalidateQueries({ queryKey: ["brand-asset"] });
      setLogoFile(null); setIconFile(null); setLogoRemoved(false); setIconRemoved(false);
      toast.success("Identidade visual salva e aplicada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a identidade visual.");
    } finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Marca" description="Defina como sua empresa aparece para toda a equipe." />
    <Panel title="Como sua empresa aparece" description={isAdmin === false ? "Somente administradores podem alterar." : undefined}>
      <div className="max-w-3xl space-y-7">
        <div className="space-y-1.5"><Label htmlFor="brand-name">Nome da empresa</Label><Input id="brand-name" value={nome} onChange={(event) => setNome(event.target.value)} disabled={!isAdmin} /><p className="text-xs text-muted-foreground">Este nome aparece no menu e nas telas de acesso.</p></div>
        <div className="space-y-3">
          <Label>Cor da marca</Label>
          <div className="flex items-center gap-3"><Input aria-label="Selecionar cor" type="color" value={cor} disabled={!isAdmin} onChange={(event) => { setCor(event.target.value.toUpperCase()); setCorTexto(event.target.value.toUpperCase()); }} className="h-11 w-16 cursor-pointer p-1" /><Input aria-label="Código hexadecimal" value={corTexto} disabled={!isAdmin} onChange={(event) => { setCorTexto(event.target.value); const valid = normalizeHex(event.target.value); if (valid) setCor(valid); }} className="w-36 font-mono uppercase" /></div>
          {!normalizeHex(corTexto) && <p className="text-xs text-destructive">Digite uma cor hexadecimal válida, como #A52C64.</p>}
          <div className="grid h-14 grid-cols-9 overflow-hidden rounded-lg border" aria-label="Escala de cores gerada">{escala.map((shade, index) => <div key={`${shade}-${index}`} style={{ backgroundColor: shade }} title={shade} />)}</div>
        </div>
        <AssetField label="Logo" hint="PNG ou JPG, até 2 MB. Prefira fundo transparente." value={logoPreview} disabled={!isAdmin} onChange={(file) => chooseFile(file, "logo")} onRemove={() => { setLogoFile(null); setLogoRemoved(true); }} />
        <AssetField label="Ícone do navegador" hint="PNG ou ICO, em formato quadrado." value={iconPreview} disabled={!isAdmin} onChange={(file) => chooseFile(file, "icon")} onRemove={() => { setIconFile(null); setIconRemoved(true); }} compact />
      </div>
    </Panel>
    <div className="grid gap-6 lg:grid-cols-2"><Panel title="Prévia — acesso"><div className="grid min-h-64 place-items-center rounded-lg border bg-muted/30 p-6"><div className="w-full max-w-64 space-y-3 text-center">{logoPreview ? <img src={logoPreview} alt="Prévia do logo" className="mx-auto max-h-12 max-w-48 object-contain" /> : <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg text-primary-foreground" style={{ backgroundColor: cor }}><ImagePlus className="h-5 w-5" /></div>}<p className="font-display font-semibold">{nome || "Nome da empresa"}</p><div className="h-9 rounded-md border bg-card" /><div className="grid h-9 place-items-center rounded-md text-sm font-medium text-primary-foreground" style={{ backgroundColor: cor }}>Entrar</div></div></div></Panel><Panel title="Prévia — menu e controles"><div className="grid min-h-64 grid-cols-2 overflow-hidden rounded-lg border"><div className="flex flex-col bg-card p-4"><PreviewBrand nome={nome} logo={logoPreview} cor={cor} /><PreviewNavigation cor={cor} /></div><div className="flex flex-col p-4 text-white" style={{ backgroundColor: shade(cor, -0.56) }}><PreviewBrand nome={nome} logo={logoPreview} cor={shade(cor, -0.38)} dark /><PreviewNavigation cor={shade(cor, -0.3)} dark /></div></div></Panel></div>
    {isAdmin && <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar alterações</Button></div>}
  </div>;
}

function AssetField({ label, hint, value, disabled, onChange, onRemove, compact = false }: { label: string; hint: string; value: string | null; disabled: boolean; onChange: (file: File | undefined) => void; onRemove: () => void; compact?: boolean }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="flex flex-wrap items-center gap-3"><Input type="file" disabled={disabled} accept="image/png,image/jpeg,image/x-icon,image/vnd.microsoft.icon" onChange={(event) => onChange(event.target.files?.[0])} className="max-w-sm" />{value && !disabled && <Button type="button" variant="outline" size="sm" onClick={onRemove}><X className="mr-2 h-4 w-4" />Remover</Button>}</div><p className="text-xs text-muted-foreground">{hint}</p>{value && <div className={compact ? "grid h-20 w-20 place-items-center rounded-lg border bg-muted/30 p-3" : "grid h-28 max-w-md place-items-center rounded-lg border bg-muted/30 p-4"}><img src={value} alt={`Prévia de ${label.toLowerCase()}`} className="max-h-full max-w-full object-contain" /></div>}</div>;
}

function PreviewBrand({ nome, logo, cor, dark = false }: { nome: string; logo: string | null; cor: string; dark?: boolean }) { return <div className="flex min-w-0 items-center gap-2 border-b pb-4" style={{ borderColor: cor }}>{logo ? <img src={logo} alt="" className="h-7 w-7 shrink-0 object-contain" /> : <span className="h-7 w-7 shrink-0 rounded-md" style={{ backgroundColor: cor }} />}<span className={dark ? "truncate text-sm font-semibold text-sidebar-foreground" : "truncate text-sm font-semibold"}>{nome || "Empresa"}</span></div>; }
function PreviewNavigation({ cor, dark = false }: { cor: string; dark?: boolean }) { return <div className="mt-5 space-y-3"><div className="flex items-center gap-2 text-xs"><LayoutDashboard className="h-4 w-4" /><span>Painel</span></div><div className="flex items-center gap-2 rounded-md p-2 text-xs" style={{ backgroundColor: cor, color: dark ? "#ffffff" : "var(--primary-foreground)" }}><MessageCircle className="h-4 w-4" /><span>WhatsApp</span></div><div className="h-8 rounded-md border" style={dark ? { borderColor: shade(cor, 0.12) } : undefined} /></div>; }