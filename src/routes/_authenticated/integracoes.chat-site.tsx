import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { SiteChatSettings } from "@/lib/types";
import { toast } from "sonner";
import { Check, Copy, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/integracoes/chat-site")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chat do site — Amoras CRM" },
      { name: "description", content: "Configure o chat instalado no site e os avisos para a equipe." },
      { property: "og:title", content: "Chat do site — Amoras CRM" },
      { property: "og:description", content: "Configure o chat instalado no site e os avisos para a equipe." },
    ],
  }),
  component: ChatSitePage,
});

const DIAS = [
  { chave: "seg", rotulo: "Seg" },
  { chave: "ter", rotulo: "Ter" },
  { chave: "qua", rotulo: "Qua" },
  { chave: "qui", rotulo: "Qui" },
  { chave: "sex", rotulo: "Sex" },
  { chave: "sab", rotulo: "Sáb" },
  { chave: "dom", rotulo: "Dom" },
];

const CANAIS = [
  { chave: "interno", rotulo: "Aviso dentro do CRM" },
  { chave: "email", rotulo: "E-mail" },
  { chave: "whatsapp", rotulo: "WhatsApp" },
];

const PADRAO: SiteChatSettings = {
  enabled: true,
  position: "direita",
  title: "Fale com a gente",
  welcome: "Olá! Deixe sua mensagem que já chamamos uma pessoa do time.",
  waiting_message: "Recebemos sua mensagem. Um atendente entra na conversa em instantes.",
  offhours_message: "Estamos fora do horário de atendimento. Deixe seu contato que respondemos no próximo dia útil.",
  fields: {
    name: { enabled: true, required: true },
    email: { enabled: true, required: true },
    phone: { enabled: true, required: false },
    subject: { enabled: true, required: false },
  },
  hours: { start: "08:00", end: "18:00", days: ["seg", "ter", "qua", "qui", "sex"] },
  notify: { target: "todos", people: [], channels: ["interno", "email"] },
};

const CAMPOS: { chave: keyof SiteChatSettings["fields"]; rotulo: string }[] = [
  { chave: "name", rotulo: "Nome" },
  { chave: "email", rotulo: "E-mail" },
  { chave: "phone", rotulo: "WhatsApp" },
  { chave: "subject", rotulo: "Assunto" },
];

function ChatSitePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SiteChatSettings>(PADRAO);
  const [saving, setSaving] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["app_settings", "site-chat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("site_chat_settings, brand_name")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const salvo = settings?.site_chat_settings as SiteChatSettings | null | undefined;
    if (salvo) setForm({ ...PADRAO, ...salvo, fields: { ...PADRAO.fields, ...salvo.fields }, hours: { ...PADRAO.hours, ...salvo.hours }, notify: { ...PADRAO.notify, ...salvo.notify } });
  }, [settings]);

  const codigo = `<script>
  window.amorasChat = { site: "${typeof window === "undefined" ? "" : window.location.host}" };
</script>
<script src="${typeof window === "undefined" ? "" : window.location.origin}/chat-site.js" async></script>`;

  async function salvar() {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ site_chat_settings: form as unknown as never })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar. Tente novamente.");
      return;
    }
    toast.success("Configurações do chat do site salvas.");
    void queryClient.invalidateQueries({ queryKey: ["app_settings", "site-chat"] });
  }

  async function copiar() {
    await navigator.clipboard.writeText(codigo);
    setCopiado(true);
    toast.success("Código copiado. Cole antes do fechamento do </body> do site.");
    setTimeout(() => setCopiado(false), 2000);
  }

  function alternarDia(dia: string) {
    setForm((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        days: prev.hours.days.includes(dia) ? prev.hours.days.filter((d) => d !== dia) : [...prev.hours.days, dia],
      },
    }));
  }

  function alternarCanal(canal: string) {
    setForm((prev) => ({
      ...prev,
      notify: {
        ...prev.notify,
        channels: prev.notify.channels.includes(canal)
          ? prev.notify.channels.filter((c) => c !== canal)
          : [...prev.notify.channels, canal],
      },
    }));
  }

  if (isLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat do site"
        description="O chat recebe a mensagem do visitante, responde que a equipe foi avisada e espera uma pessoa entrar na conversa."
        actions={
          <Button onClick={salvar} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        }
      />

      <Panel title="Instalação" description="Cole este código no site do cliente, antes do fechamento da página.">
        <div className="space-y-3">
          <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-4 text-xs leading-relaxed">{codigo}</pre>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={copiar}>
              {copiado ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copiar código
            </Button>
            <Badge variant="outline">Aguardando a primeira visita</Badge>
            <span className="text-xs text-muted-foreground">
              O recebimento das mensagens é ativado quando o sistema for instalado no servidor do cliente.
            </span>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Aparência e mensagens">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">Chat ativo no site</p>
                <p className="text-xs text-muted-foreground">Desligue para esconder o balão do site.</p>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Título do chat</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Posição do balão</Label>
                <Select
                  value={form.position}
                  onValueChange={(v) => setForm({ ...form, position: v as SiteChatSettings["position"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direita">Canto inferior direito</SelectItem>
                    <SelectItem value="esquerda">Canto inferior esquerdo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Mensagem de boas-vindas</Label>
              <Textarea rows={2} value={form.welcome} onChange={(e) => setForm({ ...form, welcome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Mensagem de espera</Label>
              <Textarea
                rows={2}
                value={form.waiting_message}
                onChange={(e) => setForm({ ...form, waiting_message: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mensagem fora do horário</Label>
              <Textarea
                rows={2}
                value={form.offhours_message}
                onChange={(e) => setForm({ ...form, offhours_message: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">A cor do chat acompanha a cor da marca definida em Configurações.</p>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Perguntas de entrada" description="O que o chat pede antes de chamar a equipe.">
            <div className="space-y-2">
              {CAMPOS.map(({ chave, rotulo }) => {
                const campo = form.fields[chave];
                return (
                  <div key={chave} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                    <p className="text-sm font-medium">{rotulo}</p>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={campo.required}
                          disabled={!campo.enabled}
                          onCheckedChange={(v) =>
                            setForm({ ...form, fields: { ...form.fields, [chave]: { ...campo, required: v === true } } })
                          }
                        />
                        Obrigatório
                      </label>
                      <Switch
                        checked={campo.enabled}
                        onCheckedChange={(v) =>
                          setForm({
                            ...form,
                            fields: { ...form.fields, [chave]: { enabled: v, required: v ? campo.required : false } },
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Horário de atendimento">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Abre às</Label>
                  <Input
                    type="time"
                    value={form.hours.start}
                    onChange={(e) => setForm({ ...form, hours: { ...form.hours, start: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha às</Label>
                  <Input
                    type="time"
                    value={form.hours.end}
                    onChange={(e) => setForm({ ...form, hours: { ...form.hours, end: e.target.value } })}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Dias de atendimento</Label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map((dia) => (
                    <Button
                      key={dia.chave}
                      type="button"
                      size="sm"
                      variant={form.hours.days.includes(dia.chave) ? "default" : "outline"}
                      onClick={() => alternarDia(dia.chave)}
                    >
                      {dia.rotulo}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Aviso para a equipe" description="Quem é avisado quando chega uma nova conversa do site.">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Quem recebe o aviso</Label>
                <Select
                  value={form.notify.target}
                  onValueChange={(v) =>
                    setForm({ ...form, notify: { ...form.notify, target: v as SiteChatSettings["notify"]["target"] } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Toda a equipe</SelectItem>
                    <SelectItem value="fila">Quem está na fila de atendimento</SelectItem>
                    <SelectItem value="pessoas">Pessoas escolhidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.notify.target === "pessoas" && (
                <div className="space-y-1.5">
                  <Label>E-mails das pessoas (separados por vírgula)</Label>
                  <Input
                    value={form.notify.people.join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notify: {
                          ...form.notify,
                          people: e.target.value.split(",").map((p) => p.trim()).filter(Boolean),
                        },
                      })
                    }
                  />
                </div>
              )}
              <div>
                <Label className="mb-2 block">Por onde avisar</Label>
                <div className="space-y-2">
                  {CANAIS.map((canal) => (
                    <label key={canal.chave} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.notify.channels.includes(canal.chave)}
                        onCheckedChange={() => alternarCanal(canal.chave)}
                      />
                      {canal.rotulo}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
