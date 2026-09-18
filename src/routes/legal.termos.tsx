import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand } from "@/routes/auth";
import { Info } from "lucide-react";

export const Route = createFileRoute("/legal/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Amoras CRM" },
      { name: "description", content: "Termos de uso do Amoras CRM." },
      { property: "og:title", content: "Termos de uso — Amoras CRM" },
      { property: "og:description", content: "Termos de uso do Amoras CRM." },
    ],
  }),
  component: TermosPage,
});

const SECOES = [
  {
    id: "aceitacao",
    titulo: "1. Aceitação dos termos",
    texto:
      "Ao acessar ou usar o Amoras CRM, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, não utilize este serviço.",
  },
  {
    id: "conta",
    titulo: "2. Cadastro e conta",
    texto:
      "Para utilizar o sistema, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades realizadas com sua conta.",
  },
  {
    id: "uso",
    titulo: "3. Uso permitido",
    texto:
      "O serviço deve ser utilizado apenas para fins lícitos, relacionados à gestão de atendimento, contatos e vendas da sua empresa. É proibido usar a plataforma para enviar spam, conteúdo ofensivo ou praticar qualquer atividade ilegal.",
  },
  {
    id: "planos",
    titulo: "4. Planos e pagamentos",
    texto:
      "Alguns recursos podem estar disponíveis apenas em planos pagos. Os valores, formas de cobrança e políticas de cancelamento serão informados no momento da contratação e podem ser alterados mediante aviso prévio.",
  },
  {
    id: "propriedade",
    titulo: "5. Propriedade intelectual",
    texto:
      "Todo o conteúdo, marca, layout e funcionalidades do sistema pertencem à empresa responsável pelo Amoras CRM, sendo vedada sua reprodução sem autorização prévia.",
  },
  {
    id: "responsabilidade",
    titulo: "6. Limitação de responsabilidade",
    texto:
      "Envidamos esforços para manter o serviço disponível e seguro, mas não garantimos operação ininterrupta. Não nos responsabilizamos por danos indiretos decorrentes do uso ou da impossibilidade de uso da plataforma.",
  },
  {
    id: "alteracoes",
    titulo: "7. Alterações nestes termos",
    texto:
      "Podemos atualizar estes termos periodicamente. Ao continuar utilizando o serviço após uma atualização, você concorda com os novos termos.",
  },
  {
    id: "contato",
    titulo: "8. Contato",
    texto:
      "Em caso de dúvidas sobre estes Termos de Uso, entre em contato com nossa equipe de suporte pelos canais disponíveis dentro do sistema.",
  },
];

function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Brand />
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Voltar para entrar
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-start gap-3 rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Este é um texto modelo de exemplo, criado apenas para fins de demonstração visual. Ele
            deve ser revisado por um profissional jurídico antes de ser usado de verdade.
          </p>
        </div>

        <h1 className="font-display text-3xl font-bold">Termos de uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 1 de julho de 2024</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:block">
            <div className="sticky top-8 rounded-2xl border bg-card p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sumário
              </p>
              <ul className="space-y-1.5 text-sm">
                {SECOES.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                      {s.titulo}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="space-y-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            {SECOES.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-8">
                <h2 className="font-display text-lg font-semibold">{s.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.texto}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
