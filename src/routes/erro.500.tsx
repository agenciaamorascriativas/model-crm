import { createFileRoute } from "@tanstack/react-router";
import { AvisoLayout } from "@/routes/erro.403";
import { ServerCrash } from "lucide-react";

export const Route = createFileRoute("/erro/500")({
  head: () => ({
    meta: [
      { title: "Erro interno — Amoras CRM" },
      { name: "description", content: "Algo deu errado do nosso lado." },
      { property: "og:title", content: "Erro interno — Amoras CRM" },
      { property: "og:description", content: "Algo deu errado do nosso lado." },
    ],
  }),
  component: () => (
    <AvisoLayout
      icon={ServerCrash}
      codigo="500"
      titulo="Algo deu errado do nosso lado"
      descricao="Encontramos um problema inesperado ao processar sua solicitação. Já fomos avisados e estamos vendo o que aconteceu. Tente novamente em instantes."
    />
  ),
});
