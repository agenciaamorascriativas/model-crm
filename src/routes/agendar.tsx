import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  EMPRESA_AGENDAMENTO,
  TIPOS_COMPROMISSO,
  DIAS_DISPONIVEIS,
  type TipoCompromisso,
} from "@/lib/demo/apoio";
import {
  MapPin,
  Clock,
  CalendarDays,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar horário — Amoras CRM" },
      {
        name: "description",
        content: "Agende seu horário com a nossa equipe de forma rápida e simples.",
      },
      { property: "og:title", content: "Agendar horário — Amoras CRM" },
      {
        property: "og:description",
        content: "Agende seu horário com a nossa equipe de forma rápida e simples.",
      },
    ],
  }),
  component: AgendarPage,
});

function formatarDataLabel(iso: string) {
  const [y = 2024, m = 1, d = 1] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

type Etapa = "tipo" | "horario" | "dados" | "confirmado";

function AgendarPage() {
  const [etapa, setEtapa] = useState<Etapa>("tipo");
  const [tipo, setTipo] = useState<TipoCompromisso | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<string>(DIAS_DISPONIVEIS[0]?.data ?? "");
  const [horario, setHorario] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacao, setObservacao] = useState("");

  const horariosDoDia = useMemo(
    () => DIAS_DISPONIVEIS.find((d) => d.data === dataSelecionada)?.horarios ?? [],
    [dataSelecionada],
  );

  function handleConfirmar(e: React.FormEvent) {
    e.preventDefault();
    setEtapa("confirmado");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div
        className="border-b bg-card"
        style={{
          background:
            "radial-gradient(1000px 400px at 50% -20%, oklch(0.93 0.05 340), transparent), var(--color-card)",
        }}
      >
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg font-bold shadow-sm">
            {EMPRESA_AGENDAMENTO.fotoIniciais}
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{EMPRESA_AGENDAMENTO.nome}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {EMPRESA_AGENDAMENTO.descricao}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {EMPRESA_AGENDAMENTO.endereco}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {etapa !== "confirmado" && (
          <ol className="mb-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {(["tipo", "horario", "dados"] as const).map((e, i) => (
              <li key={e} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium",
                    etapa === e
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className={etapa === e ? "font-medium text-foreground" : ""}>
                  {e === "tipo" ? "Serviço" : e === "horario" ? "Horário" : "Seus dados"}
                </span>
                {i < 2 && <span className="mx-1 h-px w-6 bg-border" />}
              </li>
            ))}
          </ol>
        )}

        {etapa === "tipo" && (
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold">Escolha o tipo de compromisso</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione o serviço que você deseja agendar.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-1">
              {TIPOS_COMPROMISSO.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTipo(t);
                    setEtapa("horario");
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5",
                    tipo?.id === t.id && "border-primary bg-primary/5",
                  )}
                >
                  <div>
                    <p className="font-medium">{t.nome}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.descricao}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t.duracaoMin} min
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {etapa === "horario" && tipo && (
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setEtapa("tipo")}
              className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Trocar serviço
            </button>
            <h2 className="font-display text-lg font-semibold">Escolha data e horário</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tipo.nome} · {tipo.duracaoMin} minutos
            </p>

            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Dias disponíveis
              </p>
              <div className="flex flex-wrap gap-2">
                {DIAS_DISPONIVEIS.map((d) => (
                  <button
                    key={d.data}
                    type="button"
                    onClick={() => {
                      setDataSelecionada(d.data);
                      setHorario(null);
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm capitalize transition-colors hover:border-primary",
                      dataSelecionada === d.data
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-foreground",
                    )}
                  >
                    {formatarDataLabel(d.data)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Horários disponíveis
              </p>
              <div className="flex flex-wrap gap-2">
                {horariosDoDia.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHorario(h)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors hover:border-primary",
                      horario === h ? "border-primary bg-primary text-primary-foreground" : "text-foreground",
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <Button className="mt-6 w-full" disabled={!horario} onClick={() => setEtapa("dados")}>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {etapa === "dados" && tipo && horario && (
          <div className="grid gap-6 sm:grid-cols-[1fr_260px]">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setEtapa("horario")}
                className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Trocar horário
              </button>
              <h2 className="font-display text-lg font-semibold">Seus dados</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Preencha as informações abaixo para confirmar seu agendamento.
              </p>
              <form onSubmit={handleConfirmar} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@email.com"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="observacao">Observação (opcional)</Label>
                  <Textarea
                    id="observacao"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Conte algo que possa ajudar no atendimento"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Confirmar agendamento
                </Button>
              </form>
            </div>

            <div className="h-fit rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="font-display text-sm font-semibold">Resumo</h3>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Serviço</dt>
                  <dd className="font-medium">{tipo.nome}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Duração</dt>
                  <dd className="font-medium">{tipo.duracaoMin} minutos</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Data</dt>
                  <dd className="font-medium capitalize">{formatarDataLabel(dataSelecionada)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Horário</dt>
                  <dd className="font-medium">{horario}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Local</dt>
                  <dd className="font-medium">{EMPRESA_AGENDAMENTO.endereco}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {etapa === "confirmado" && tipo && horario && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold">Agendamento confirmado!</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Enviamos os detalhes para <strong>{email}</strong>. Esperamos você{" "}
              <strong className="capitalize">{formatarDataLabel(dataSelecionada)}</strong> às{" "}
              <strong>{horario}</strong> para {tipo.nome.toLowerCase()}.
            </p>
            <div className="mt-2 w-full max-w-xs rounded-xl border bg-muted/40 p-4 text-left text-sm">
              <p className="font-medium">{nome}</p>
              <p className="text-muted-foreground">{telefone}</p>
              <p className="text-muted-foreground">{email}</p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                setEtapa("tipo");
                setTipo(null);
                setHorario(null);
                setNome("");
                setTelefone("");
                setEmail("");
                setObservacao("");
              }}
            >
              Fazer novo agendamento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
