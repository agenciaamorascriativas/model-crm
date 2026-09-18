// Dados de exemplo do bloco Atendimento (fila, respostas rápidas, modelos e canal oficial)

export type Prioridade = "alta" | "media" | "baixa";
export type StatusFila = "aguardando" | "em_atendimento" | "resolvida";
export type Canal = "whatsapp" | "instagram" | "facebook" | "email";

export type ConversaFila = {
  id: string;
  contato: string;
  canal: Canal;
  ultimoAssunto: string;
  esperaMinutos: number;
  prioridade: Prioridade;
  status: StatusFila;
  responsavel: string | null;
};

export const ATENDENTES = [
  "Camila Duarte",
  "Bruno Alencar",
  "Fernanda Lopes",
  "Diego Martins",
  "Juliana Prado",
];

export const CONVERSAS_FILA: ConversaFila[] = [
  {
    id: "conv-1",
    contato: "Marina Souza",
    canal: "whatsapp",
    ultimoAssunto: "Quer saber o prazo de entrega do pedido #4521",
    esperaMinutos: 18,
    prioridade: "alta",
    status: "aguardando",
    responsavel: null,
  },
  {
    id: "conv-2",
    contato: "Rodrigo Teixeira",
    canal: "instagram",
    ultimoAssunto: "Dúvida sobre tamanhos disponíveis",
    esperaMinutos: 6,
    prioridade: "media",
    status: "aguardando",
    responsavel: null,
  },
  {
    id: "conv-3",
    contato: "Ana Beatriz Costa",
    canal: "whatsapp",
    ultimoAssunto: "Solicitou reembolso de produto com defeito",
    esperaMinutos: 32,
    prioridade: "alta",
    status: "em_atendimento",
    responsavel: "Camila Duarte",
  },
  {
    id: "conv-4",
    contato: "Paulo Henrique",
    canal: "facebook",
    ultimoAssunto: "Confirmou pagamento e pediu nota fiscal",
    esperaMinutos: 3,
    prioridade: "baixa",
    status: "aguardando",
    responsavel: null,
  },
  {
    id: "conv-5",
    contato: "Larissa Nogueira",
    canal: "email",
    ultimoAssunto: "Reclamação sobre atraso na entrega",
    esperaMinutos: 45,
    prioridade: "alta",
    status: "em_atendimento",
    responsavel: "Bruno Alencar",
  },
  {
    id: "conv-6",
    contato: "Felipe Cardoso",
    canal: "whatsapp",
    ultimoAssunto: "Perguntou sobre parcelamento no cartão",
    esperaMinutos: 9,
    prioridade: "media",
    status: "aguardando",
    responsavel: null,
  },
  {
    id: "conv-7",
    contato: "Renata Vasconcelos",
    canal: "whatsapp",
    ultimoAssunto: "Agradeceu o atendimento e finalizou a compra",
    esperaMinutos: 0,
    prioridade: "baixa",
    status: "resolvida",
    responsavel: "Fernanda Lopes",
  },
  {
    id: "conv-8",
    contato: "Gustavo Ramos",
    canal: "instagram",
    ultimoAssunto: "Quer trocar o produto por outro tamanho",
    esperaMinutos: 0,
    prioridade: "media",
    status: "resolvida",
    responsavel: "Diego Martins",
  },
];

export const INDICADORES_FILA = {
  aguardando: CONVERSAS_FILA.filter((c) => c.status === "aguardando").length,
  emAtendimento: CONVERSAS_FILA.filter((c) => c.status === "em_atendimento").length,
  tempoMedioEsperaMinutos: 14,
  resolvidasHoje: CONVERSAS_FILA.filter((c) => c.status === "resolvida").length + 12,
};

export type RespostaRapida = {
  id: string;
  nome: string;
  atalho: string;
  categoria: string;
  mensagem: string;
  usos: number;
};

export const CATEGORIAS_RESPOSTAS = ["Vendas", "Financeiro", "Suporte", "Pós-venda"];

export const RESPOSTAS_RAPIDAS: RespostaRapida[] = [
  {
    id: "resp-1",
    nome: "Orçamento padrão",
    atalho: "/orcamento",
    categoria: "Vendas",
    mensagem: "Olá {{nome}}, tudo bem? Segue nosso orçamento para o produto solicitado. Qualquer dúvida, estou à disposição!",
    usos: 128,
  },
  {
    id: "resp-2",
    nome: "Boas-vindas",
    atalho: "/boasvindas",
    categoria: "Vendas",
    mensagem: "Oi {{nome}}! Seja muito bem-vindo(a) à Amoras. Como posso te ajudar hoje?",
    usos: 342,
  },
  {
    id: "resp-3",
    nome: "Prazo de entrega",
    atalho: "/prazo",
    categoria: "Pós-venda",
    mensagem: "Olá {{nome}}, seu pedido tem previsão de entrega de 5 a 8 dias úteis a partir da confirmação do pagamento.",
    usos: 210,
  },
  {
    id: "resp-4",
    nome: "Segunda via de boleto",
    atalho: "/segundavia",
    categoria: "Financeiro",
    mensagem: "Oi {{nome}}, aqui está a segunda via do seu boleto. O vencimento foi atualizado para hoje mais 3 dias.",
    usos: 87,
  },
  {
    id: "resp-5",
    nome: "Política de troca",
    atalho: "/troca",
    categoria: "Suporte",
    mensagem: "{{nome}}, você pode solicitar troca em até 30 dias após o recebimento, desde que o produto esteja sem uso.",
    usos: 154,
  },
  {
    id: "resp-6",
    nome: "Confirmação de pagamento",
    atalho: "/pagamentook",
    categoria: "Financeiro",
    mensagem: "Recebemos seu pagamento, {{nome}}! Já estamos preparando seu pedido para envio.",
    usos: 176,
  },
  {
    id: "resp-7",
    nome: "Encerramento de atendimento",
    atalho: "/finalizar",
    categoria: "Suporte",
    mensagem: "Fico feliz em ter ajudado, {{nome}}! Se precisar de algo mais, é só chamar por aqui.",
    usos: 265,
  },
];

export type CategoriaTemplate = "utilidade" | "marketing" | "autenticacao";
export type StatusAprovacao = "aprovado" | "em_analise" | "reprovado";

export type ModeloMensagem = {
  id: string;
  nome: string;
  categoria: CategoriaTemplate;
  idioma: string;
  status: StatusAprovacao;
  corpo: string;
};

export const MODELOS_MENSAGEM: ModeloMensagem[] = [
  {
    id: "mod-1",
    nome: "confirmacao_pedido",
    categoria: "utilidade",
    idioma: "Português (BR)",
    status: "aprovado",
    corpo: "Olá {{1}}, seu pedido {{2}} foi confirmado e já está em preparação. Prazo estimado: {{3}} dias úteis.",
  },
  {
    id: "mod-2",
    nome: "promocao_semana",
    categoria: "marketing",
    idioma: "Português (BR)",
    status: "aprovado",
    corpo: "{{1}}, aproveite! Até 40% OFF em toda a coleção nova. Válido somente até domingo.",
  },
  {
    id: "mod-3",
    nome: "codigo_verificacao",
    categoria: "autenticacao",
    idioma: "Português (BR)",
    status: "aprovado",
    corpo: "Seu código de verificação Amoras é {{1}}. Não compartilhe com ninguém.",
  },
  {
    id: "mod-4",
    nome: "lembrete_carrinho",
    categoria: "marketing",
    idioma: "Português (BR)",
    status: "em_analise",
    corpo: "Oi {{1}}, você deixou itens no carrinho! Finalize sua compra e garanta o frete grátis.",
  },
  {
    id: "mod-5",
    nome: "pesquisa_satisfacao",
    categoria: "utilidade",
    idioma: "Português (BR)",
    status: "em_analise",
    corpo: "{{1}}, como foi sua experiência com o pedido {{2}}? Responda de 1 a 5 estrelas.",
  },
  {
    id: "mod-6",
    nome: "reativacao_cliente",
    categoria: "marketing",
    idioma: "Português (BR)",
    status: "reprovado",
    corpo: "Sentimos sua falta, {{1}}! Volte e ganhe 15% de desconto na próxima compra.",
  },
];

export type EventoCanal = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  tipo: "info" | "sucesso" | "alerta";
};

export const EVENTOS_CANAL: EventoCanal[] = [
  {
    id: "ev-1",
    titulo: "Modelo aprovado",
    descricao: "O modelo \"confirmacao_pedido\" foi aprovado pela Meta.",
    data: "Hoje às 09:14",
    tipo: "sucesso",
  },
  {
    id: "ev-2",
    titulo: "Qualidade do número",
    descricao: "Qualidade do número classificada como Alta.",
    data: "Ontem às 17:40",
    tipo: "info",
  },
  {
    id: "ev-3",
    titulo: "Limite de envio atualizado",
    descricao: "Limite diário aumentado para 10.000 conversas.",
    data: "Ontem às 08:02",
    tipo: "info",
  },
  {
    id: "ev-4",
    titulo: "Modelo em análise",
    descricao: "O modelo \"lembrete_carrinho\" está em revisão pela Meta.",
    data: "3 dias atrás",
    tipo: "alerta",
  },
];
