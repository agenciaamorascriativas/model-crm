import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Brand } from "@/routes/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/senha/redefinir")({
  head: () => ({
    meta: [
      { title: "Definir nova senha — Amoras CRM" },
      { name: "description", content: "Crie uma nova senha para acessar o Amoras CRM." },
      { property: "og:title", content: "Definir nova senha — Amoras CRM" },
      { property: "og:description", content: "Crie uma nova senha para acessar o Amoras CRM." },
    ],
  }),
  component: RedefinirSenhaPage,
});

const REQUISITOS = [
  { id: "tamanho", label: "Pelo menos 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "maiuscula", label: "Uma letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "numero", label: "Um número", test: (v: string) => /[0-9]/.test(v) },
  { id: "especial", label: "Um caractere especial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function RedefinirSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salvo, setSalvo] = useState(false);

  const atendidos = useMemo(() => REQUISITOS.filter((r) => r.test(senha)).length, [senha]);
  const forca = atendidos === 0 ? 0 : atendidos <= 2 ? 1 : atendidos === 3 ? 2 : 3;
  const forcaLabel = ["Muito fraca", "Fraca", "Boa", "Forte"][forca];
  const forcaCor = ["bg-destructive", "bg-destructive", "bg-amber-500", "bg-primary"][forca];

  const senhasIguais = senha.length > 0 && senha === confirmacao;
  const podeSalvar = atendidos === REQUISITOS.length && senhasIguais;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (podeSalvar) setSalvo(true);
  }

  return (
    <Centered>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Brand />
          <p className="text-center text-sm text-muted-foreground">Crie uma nova senha de acesso</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {salvo ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <h1 className="font-display text-lg font-semibold">Senha atualizada</h1>
              <p className="text-sm text-muted-foreground">
                Sua senha foi redefinida com sucesso. Agora você já pode entrar novamente.
              </p>
              <Button asChild className="mt-2 w-full">
                <Link to="/auth">Ir para a tela de entrada</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-lg font-semibold">Definir nova senha</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha uma senha forte para proteger sua conta.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="senha">Nova senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  {senha.length > 0 && (
                    <div className="pt-1">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1.5 flex-1 rounded-full bg-muted",
                              i < forca && forcaCor,
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Força da senha: {forcaLabel}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmacao">Confirmar nova senha</Label>
                  <Input
                    id="confirmacao"
                    type="password"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  {confirmacao.length > 0 && !senhasIguais && (
                    <p className="text-xs text-destructive">As senhas não coincidem.</p>
                  )}
                </div>
                <ul className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                  {REQUISITOS.map((r) => {
                    const ok = r.test(senha);
                    return (
                      <li key={r.id} className="flex items-center gap-2 text-xs">
                        {ok ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className={ok ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button type="submit" className="w-full" disabled={!podeSalvar}>
                  Salvar nova senha
                </Button>
              </form>
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
