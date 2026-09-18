import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Panel, PageHeader } from "@/components/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { idiomas, fusosHorarios } from "@/lib/demo/configuracoes";
import type { Profile } from "@/lib/types";

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

async function fetchMyProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("Sessão expirada.");
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return { userId: user.id, email: user.email ?? null, profile: data as unknown as Profile };
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ user_id: user.id, email: user.email ?? null })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return { userId: user.id, email: user.email ?? null, profile: created as unknown as Profile };
}

async function avatarUrl(path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from("avatars").download(path);
  if (error) return null;
  return URL.createObjectURL(data);
}

function PerfilPage() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useQuery({ queryKey: ["my-profile"], queryFn: fetchMyProfile });
  const { data: avatar } = useQuery({
    queryKey: ["my-avatar", data?.profile.avatar_url],
    queryFn: () => avatarUrl(data?.profile.avatar_url ?? null),
    enabled: Boolean(data?.profile.avatar_url),
  });

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [idioma, setIdioma] = useState(idiomas[0] ?? "");
  const [fuso, setFuso] = useState(fusosHorarios[0] ?? "");
  const [assinatura, setAssinatura] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!data) return;
    setNome(data.profile.full_name ?? "");
    setCargo(data.profile.job_title ?? "");
    setTelefone(data.profile.phone ?? "");
    setIdioma(data.profile.language ?? idiomas[0] ?? "");
    setFuso(data.profile.timezone ?? fusosHorarios[0] ?? "");
    setAssinatura(data.profile.signature ?? "");
  }, [data]);

  const iniciais = (nome || data?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function trocarFoto(file: File) {
    if (!data) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter até 2 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${data.userId}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      if (data.profile.avatar_url) {
        await supabase.storage.from("avatars").remove([data.profile.avatar_url]);
      }
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("user_id", data.userId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["my-avatar"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto atualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a foto.");
    } finally {
      setUploading(false);
    }
  }

  async function removerFoto() {
    if (!data?.profile.avatar_url) return;
    setUploading(true);
    try {
      await supabase.storage.from("avatars").remove([data.profile.avatar_url]);
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", data.userId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto removida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover a foto.");
    } finally {
      setUploading(false);
    }
  }

  async function salvar() {
    if (!data) return;
    if (!nome.trim()) {
      toast.error("Digite o seu nome.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: nome.trim(),
        job_title: cargo.trim() || null,
        phone: telefone.trim() || null,
        language: idioma || null,
        timezone: fuso || null,
        signature: assinatura.trim() || null,
      })
      .eq("user_id", data.userId);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar o perfil.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Perfil salvo.");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando perfil...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" description="Como você aparece para o resto da equipe." />

      <Panel title="Foto e identificação">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="h-20 w-20">
            {avatar && <AvatarImage src={avatar} alt="" />}
            <AvatarFallback className="bg-secondary text-lg text-secondary-foreground">{iniciais}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Trocar foto
              </Button>
              {data?.profile.avatar_url && (
                <Button variant="ghost" disabled={uploading} onClick={removerFoto}>
                  Remover
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">PNG ou JPG, até 2 MB.</p>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void trocarFoto(file);
              }}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Dados pessoais">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={data?.email ?? ""} readOnly disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Cargo</Label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={40} />
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
          <div className="space-y-1.5">
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
        <Textarea value={assinatura} onChange={(e) => setAssinatura(e.target.value)} rows={4} maxLength={600} />
      </Panel>

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
