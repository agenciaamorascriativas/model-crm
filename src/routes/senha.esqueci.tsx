import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Brand } from "@/routes/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/senha/esqueci")({
  head: () => ({
    meta: [
      { title: "Esqueci minha senha — Amoras CRM" },
      { name: "description", content: "Recupere o acesso à sua conta do Amoras CRM." },
      { property: "og:title", content: "Esqueci minha senha — Amoras CRM" },
      { property: "og:description", content: "Recupere o acesso à sua conta do Amoras CRM." },
    ],
  }),
  component: EsqueciSenhaPage,
});

function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviado(true);
  }

  return (
    <Centered>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Brand />
          <p className="text-center text-sm text-muted-foreground">
            Recupere o acesso à sua conta
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <h1 className="font-display text-lg font-semibold">Verifique seu e-mail</h1>
              <p className="text-sm text-muted-foreground">
                Se houver uma conta associada a <strong>{email}</strong>, enviamos um link para
                redefinir sua senha.
              </p>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link to="/auth">Voltar para entrar</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-lg font-semibold">Esqueci minha senha</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Informe seu e-mail e enviaremos um link para você criar uma nova senha.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@empresa.com"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Enviar link de recuperação
                </Button>
              </form>
              <Link
                to="/auth"
                className="mt-5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar para entrar
              </Link>
            </>
          )}
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
