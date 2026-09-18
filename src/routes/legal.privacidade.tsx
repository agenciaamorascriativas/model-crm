import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand } from "@/routes/auth";
import { Info } from "lucide-react";

export const Route = createFileRoute("/legal/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Amoras CRM" },
      { name: "description", content: "Política de privacidade do Amoras CRM." },
      { property: "og:title", content: "Política de privacidade — Amoras CRM" },
      { property: "og:description", content: "Política de privacidade do Amoras CRM." },
    ],
  }),
  component: PrivacidadePage,
});

const SECOES = [
  {
    id: "coleta",
    titulo: "1. Quais dados coletamos",
    texto:
      "Coletamos informações fornecidas por você, como nome, e-mail e telefone, além de dados gerados pelo uso do sistema, como conversas, contatos e atividades registradas na plataforma.",
  },
  {
    id: "uso-dados",
    titulo: "2. Como usamos seus dados",
    texto:
      "Utilizamos os dados para viabilizar o funcionamento do CRM, melhorar nossos serviços, oferecer suporte e enviar comunicações relevantes sobre sua conta.",
  },
  {
    id: "compartilhamento",
    titulo: "3. Compartilhamento de informações",
    texto:
      "Não vendemos seus dados. Podemos compartilhar informações com prestadores de serviço que nos ajudam a operar a plataforma, sempre respeitando obrigações de confidencialidade.",
  },
  {
    id: "armazenamento",
    titulo: "4. Armazenamento e segurança",
    texto:
      "Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração indevida.",
  },
  {
    id: "direitos",
    titulo: "5. Seus direitos",
    texto:
      "Você pode solicitar a qualquer momento a atualização, correção ou exclusão dos seus dados pessoais, conforme previsto na legislação de proteção de dados aplicável.",
  },
  {
    id: "cookies",
    titulo: "6. Cookies",
    texto:
      "Utilizamos cookies para melhorar sua experiência de navegação, lembrar preferências e entender como o sistema é utilizado.",
  },
  {
    id: "alteracoes",
    titulo: "7. Alterações nesta política",
    texto:
      "Esta política pode ser atualizada periodicamente. Recomendamos revisá-la de tempos em tempos para se manter informado sobre como cuidamos dos seus dados.",
  },
  {
    id: "contato",
    titulo: "8. Contato",
    texto:
      "Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, entre em contato com nossa equipe de suporte pelos canais disponíveis dentro do sistema.",
  },
];

function PrivacidadePage() {
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

        <h1 className="font-display text-3xl font-bold">Política de privacidade</h1>
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
