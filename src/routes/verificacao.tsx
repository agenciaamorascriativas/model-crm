import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Brand } from "@/routes/auth";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/verificacao")({
  head: () => ({
    meta: [
      { title: "Verificação em duas etapas — Amoras CRM" },
      { name: "description", content: "Confirme sua identidade para continuar." },
      { property: "og:title", content: "Verificação em duas etapas — Amoras CRM" },
      { property: "og:description", content: "Confirme sua identidade para continuar." },
    ],
  }),
  component: VerificacaoPage,
});

function VerificacaoPage() {
  const [codigo, setCodigo] = useState("");
  const [usarRecuperacao, setUsarRecuperacao] = useState(false);

  return (
    <Centered>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Brand />
          <p className="text-center text-sm text-muted-foreground">Verificação em duas etapas</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-lg font-semibold">Confirme seu acesso</h1>
            <p className="text-sm text-muted-foreground">
              {usarRecuperacao
                ? "Digite um dos seus códigos de recuperação salvos."
                : "Enviamos um código de 6 dígitos para o seu e-mail cadastrado."}
            </p>
          </div>

          {usarRecuperacao ? (
            <form className="space-y-4">
              <input
                type="text"
                placeholder="XXXXX-XXXXX"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-center text-sm tracking-widest shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button type="submit" className="w-full">
                Confirmar código de recuperação
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={codigo} onChange={setCodigo}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button className="w-full" disabled={codigo.length !== 6}>
                Verificar código
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Reenviar código
              </button>
            </div>
          )}

          <div className="mt-5 flex flex-col items-center gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setUsarRecuperacao((v) => !v)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {usarRecuperacao ? "Usar código enviado por e-mail" : "Usar um código de recuperação"}
            </button>
            <Link
              to="/auth"
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar para entrar
            </Link>
          </div>
        </div>
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(1200px 600px at 80% -10%, oklch(0.93 0.05 340), transparent), var(--color-background)",
      }}
    >
      {children}
    </div>
  );
}
