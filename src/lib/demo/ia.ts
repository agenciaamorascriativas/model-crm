// Dados de exemplo do bloco Inteligência Artificial. Usados por todas as telas de IA.

export type PapelAgente = "atendimento" | "qualificacao" | "agendamento" | "pos_venda";
export type StatusAgente = "ativo" | "pausado";
export type CanalAgente = "whatsapp" | "instagram" | "site" | "todos";

export const PAPEL_LABEL: Record<PapelAgente, string> = {
  atendimento: "Atendimento",
  qualificacao: "Qualificação",
  agendamento: "Agendamento",
  pos_venda: "Pós-venda",
};

export const CANAL_LABEL: Record<CanalAgente, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  site: "Site",
  todos: "Todos os canais",
};

export interface Agente {
  id: string;
  nome: string;
  papel: PapelAgente;
  status: StatusAgente;
  canal: CanalAgente;
  modelo: string;
  tomDeVoz: string;
  instrucoes: string;
  habilidades: string[]; // ids de Habilidade
  conversas: number;
  horarioInicio: string;
  horarioFim: string;
  transferirQuando: string;
}

export const agentes: Agente[] = [
  {
    id: "ag-1",
    nome: "Amora",
    papel: "atendimento",
    status: "ativo",
    canal: "whatsapp",
    modelo: "GPT-4o mini",
    tomDeVoz: "Amigável e objetivo",
    instrucoes:
      "Você é a Amora, assistente virtual da loja. Cumprimente o cliente, entenda a necessidade e ofereça ajuda rápida. Sempre confirme dados antes de agir.",
    habilidades: ["hab-1", "hab-4", "hab-5"],
    conversas: 428,
    horarioInicio: "08:00",
    horarioFim: "20:00",
    transferirQuando: "Cliente pedir para falar com humano ou reclamar de forma insistente",
  },
  {
    id: "ag-2",
    nome: "Qualifica+",
    papel: "qualificacao",
    status: "ativo",
    canal: "site",
    modelo: "GPT-4o mini",
    tomDeVoz: "Consultivo e direto",
    instrucoes:
      "Faça perguntas de qualificação (orçamento, prazo, necessidade) antes de encaminhar o lead para o time comercial.",
    habilidades: ["hab-2", "hab-6"],
    conversas: 156,
    horarioInicio: "09:00",
    horarioFim: "18:00",
    transferirQuando: "Lead com alto potencial de compra imediata",
  },
  {
    id: "ag-3",
    nome: "Agenda Fácil",
    papel: "agendamento",
    status: "pausado",
    canal: "whatsapp",
    modelo: "GPT-4o mini",
    tomDeVoz: "Educado e prático",
    instrucoes: "Ajude o cliente a marcar, remarcar ou cancelar horários consultando a agenda disponível.",
    habilidades: ["hab-1", "hab-3"],
    conversas: 89,
    horarioInicio: "08:00",
    horarioFim: "19:00",
    transferirQuando: "Não houver horário disponível nos próximos 7 dias",
  },
  {
    id: "ag-4",
    nome: "Pós-venda Care",
    papel: "pos_venda",
    status: "ativo",
    canal: "todos",
    modelo: "GPT-4o mini",
    tomDeVoz: "Empático e atencioso",
    instrucoes: "Acompanhe o cliente após a compra, tire dúvidas e registre eventuais problemas.",
    habilidades: ["hab-4", "hab-6"],
    conversas: 203,
    horarioInicio: "08:00",
    horarioFim: "22:00",
    transferirQuando: "Reclamação sobre produto com defeito",
  },
];

export type CategoriaHabilidade = "agenda" | "vendas" | "conhecimento" | "atendimento" | "contatos";

export interface Habilidade {
  id: string;
  nome: string;
  categoria: CategoriaHabilidade;
  descricao: string;
  parametros: string[];
  ativa: boolean;
  agentesQueUsam: string[]; // ids de Agente
}

export const habilidades: Habilidade[] = [
  {
    id: "hab-1",
    nome: "Consultar agenda",
    categoria: "agenda",
    descricao: "Verifica horários disponíveis na agenda da equipe antes de propor um agendamento.",
    parametros: ["data", "período preferido", "profissional"],
    ativa: true,
    agentesQueUsam: ["ag-1", "ag-3"],
  },
  {
    id: "hab-2",
    nome: "Criar negócio",
    categoria: "vendas",
    descricao: "Cria um novo negócio no funil de vendas com os dados coletados na conversa.",
    parametros: ["nome do contato", "etapa inicial", "valor estimado"],
    ativa: true,
    agentesQueUsam: ["ag-2"],
  },
  {
    id: "hab-3",
    nome: "Enviar orçamento",
    categoria: "vendas",
    descricao: "Monta e envia um orçamento com base no catálogo de produtos e serviços.",
    parametros: ["itens", "condição de pagamento"],
    ativa: false,
    agentesQueUsam: ["ag-3"],
  },
  {
    id: "hab-4",
    nome: "Buscar na base de conhecimento",
    categoria: "conhecimento",
    descricao: "Consulta a base de conhecimento para responder dúvidas frequentes com precisão.",
    parametros: ["pergunta do cliente"],
    ativa: true,
    agentesQueUsam: ["ag-1", "ag-4"],
  },
  {
    id: "hab-5",
    nome: "Transferir para humano",
    categoria: "atendimento",
    descricao: "Encerra o atendimento automático e encaminha a conversa para um atendente humano.",
    parametros: ["motivo da transferência", "equipe de destino"],
    ativa: true,
    agentesQueUsam: ["ag-1"],
  },
  {
    id: "hab-6",
    nome: "Etiquetar contato",
    categoria: "contatos",
    descricao: "Adiciona etiquetas ao contato conforme informações identificadas na conversa.",
    parametros: ["etiqueta"],
    ativa: true,
    agentesQueUsam: ["ag-2", "ag-4"],
  },
];

export type TipoCondicaoRoteamento = "palavra_chave" | "etiqueta" | "horario" | "origem";

export interface RegraRoteamento {
  id: string;
  ordem: number;
  ativa: boolean;
  tipoCondicao: TipoCondicaoRoteamento;
  condicao: string;
  destino: string; // agente ou equipe
  tipoDestino: "agente" | "equipe";
}

export const regrasRoteamento: RegraRoteamento[] = [
  {
    id: "rt-1",
    ordem: 1,
    ativa: true,
    tipoCondicao: "palavra_chave",
    condicao: "contém \"cancelar\" ou \"reembolso\"",
    destino: "Equipe Financeiro",
    tipoDestino: "equipe",
  },
  {
    id: "rt-2",
    ordem: 2,
    ativa: true,
    tipoCondicao: "etiqueta",
    condicao: "contato com etiqueta \"cliente VIP\"",
    destino: "Pós-venda Care",
    tipoDestino: "agente",
  },
  {
    id: "rt-3",
    ordem: 3,
    ativa: true,
    tipoCondicao: "horario",
    condicao: "fora do horário comercial (20h–08h)",
    destino: "Amora",
    tipoDestino: "agente",
  },
  {
    id: "rt-4",
    ordem: 4,
    ativa: false,
    tipoCondicao: "origem",
    condicao: "mensagem vinda do Instagram",
    destino: "Equipe Marketing",
    tipoDestino: "equipe",
  },
  {
    id: "rt-5",
    ordem: 5,
    ativa: true,
    tipoCondicao: "palavra_chave",
    condicao: "contém \"agendar\" ou \"marcar horário\"",
    destino: "Agenda Fácil",
    tipoDestino: "agente",
  },
];

export type TipoFonteConhecimento = "documento" | "site" | "perguntas_respostas" | "catalogo";
export type StatusProcessamento = "processando" | "concluido" | "erro";

export interface FonteConhecimento {
  id: string;
  nome: string;
  tipo: TipoFonteConhecimento;
  status: StatusProcessamento;
  trechos: number;
  atualizadoEm: string;
}

export const fontesConhecimento: FonteConhecimento[] = [
  {
    id: "fc-1",
    nome: "Política de trocas e devoluções.pdf",
    tipo: "documento",
    status: "concluido",
    trechos: 24,
    atualizadoEm: "2024-05-02",
  },
  {
    id: "fc-2",
    nome: "www.lojaamoras.com.br",
    tipo: "site",
    status: "concluido",
    trechos: 58,
    atualizadoEm: "2024-05-08",
  },
  {
    id: "fc-3",
    nome: "Perguntas frequentes — Entregas",
    tipo: "perguntas_respostas",
    status: "processando",
    trechos: 12,
    atualizadoEm: "2024-05-10",
  },
  {
    id: "fc-4",
    nome: "Catálogo de produtos — Verão",
    tipo: "catalogo",
    status: "erro",
    trechos: 0,
    atualizadoEm: "2024-05-09",
  },
];

export interface TrechoConhecimento {
  id: string;
  fonte: string;
  trecho: string;
  relevancia: number; // 0-100
}

export const trechosConhecimento: TrechoConhecimento[] = [
  {
    id: "tr-1",
    fonte: "Política de trocas e devoluções.pdf",
    trecho: "Trocas podem ser solicitadas em até 30 dias após o recebimento, com produto sem uso.",
    relevancia: 96,
  },
  {
    id: "tr-2",
    fonte: "www.lojaamoras.com.br",
    trecho: "O frete é grátis para compras acima de R$ 199 em todo o Brasil.",
    relevancia: 88,
  },
  {
    id: "tr-3",
    fonte: "Perguntas frequentes — Entregas",
    trecho: "O prazo médio de entrega é de 5 a 10 dias úteis, dependendo da região.",
    relevancia: 81,
  },
];

export interface FatoMemoria {
  id: string;
  fato: string;
  origem: string;
  data: string;
}

export interface MemoriaContato {
  id: string;
  contato: string;
  resumo: string;
  fatos: FatoMemoria[];
}

export const memoriasContatos: MemoriaContato[] = [
  {
    id: "mc-1",
    contato: "Fernanda Alves",
    resumo: "Cliente recorrente, prefere contato por WhatsApp à tarde e já comprou 3 vezes.",
    fatos: [
      { id: "ft-1", fato: "Prefere ser chamada de Fê", origem: "Conversa em 12/04/2024", data: "2024-04-12" },
      { id: "ft-2", fato: "Tem alergia a determinados tecidos sintéticos", origem: "Conversa em 20/04/2024", data: "2024-04-20" },
      { id: "ft-3", fato: "Aniversário em outubro", origem: "Formulário de cadastro", data: "2024-03-01" },
    ],
  },
  {
    id: "mc-2",
    contato: "Carlos Nogueira",
    resumo: "Ainda não comprou, está em fase de comparação de preços.",
    fatos: [
      { id: "ft-4", fato: "Interessado em pacote corporativo para 10 pessoas", origem: "Conversa em 05/05/2024", data: "2024-05-05" },
      { id: "ft-5", fato: "Prefere pagamento via boleto", origem: "Conversa em 05/05/2024", data: "2024-05-05" },
    ],
  },
  {
    id: "mc-3",
    contato: "Juliana Prado",
    resumo: "Cliente insatisfeita com atraso na última entrega, resolvido com desconto.",
    fatos: [
      { id: "ft-6", fato: "Recebeu 15% de desconto por atraso na entrega", origem: "Conversa em 28/04/2024", data: "2024-04-28" },
    ],
  },
];

export type StatusCaso = "aberto" | "em_revisao" | "resolvido";

export interface CasoIA {
  id: string;
  contato: string;
  status: StatusCaso;
  motivo: string;
  resumoConversa: string;
  acaoSugerida: string;
  respostaCorreta?: string;
  data: string;
}

export const casosIA: CasoIA[] = [
  {
    id: "cs-1",
    contato: "Ricardo Souza",
    status: "aberto",
    motivo: "IA não soube responder sobre prazo de garantia estendida",
    resumoConversa: "Cliente perguntou sobre garantia estendida de 2 anos e a IA respondeu que não tinha essa informação.",
    acaoSugerida: "Adicionar trecho sobre garantia estendida na base de conhecimento",
    data: "2024-05-11",
  },
  {
    id: "cs-2",
    contato: "Patrícia Lima",
    status: "em_revisao",
    motivo: "IA ofereceu desconto não autorizado",
    resumoConversa: "Durante a negociação, a IA mencionou um desconto de 20% que não é uma política vigente.",
    acaoSugerida: "Revisar instruções do agente de vendas para não citar percentuais de desconto",
    data: "2024-05-09",
  },
  {
    id: "cs-3",
    contato: "Marcos Vinícius",
    status: "resolvido",
    motivo: "IA não identificou pedido de cancelamento",
    resumoConversa: "Cliente pediu para cancelar o pedido, mas a IA continuou o fluxo de qualificação.",
    acaoSugerida: "Ensinar a IA a priorizar pedidos de cancelamento",
    respostaCorreta: "Ao identificar pedido de cancelamento, interrompa o fluxo atual e transfira para a equipe financeira imediatamente.",
    data: "2024-05-06",
  },
];

export interface ExecucaoIA {
  id: string;
  agente: string;
  acao: string;
  contato: string;
  resultado: "sucesso" | "falha";
  data: string;
}

export const execucoesRecentes: ExecucaoIA[] = [
  { id: "ex-1", agente: "Amora", acao: "Buscar na base de conhecimento", contato: "Fernanda Alves", resultado: "sucesso", data: "há 5 min" },
  { id: "ex-2", agente: "Qualifica+", acao: "Criar negócio", contato: "Carlos Nogueira", resultado: "sucesso", data: "há 22 min" },
  { id: "ex-3", agente: "Agenda Fácil", acao: "Consultar agenda", contato: "Juliana Prado", resultado: "falha", data: "há 40 min" },
  { id: "ex-4", agente: "Pós-venda Care", acao: "Etiquetar contato", contato: "Ricardo Souza", resultado: "sucesso", data: "há 1 h" },
  { id: "ex-5", agente: "Amora", acao: "Transferir para humano", contato: "Patrícia Lima", resultado: "sucesso", data: "há 2 h" },
];

export interface AtendimentoPorDia {
  dia: string;
  total: number;
}

export const atendimentosPorDia: AtendimentoPorDia[] = [
  { dia: "Seg", total: 62 },
  { dia: "Ter", total: 74 },
  { dia: "Qua", total: 58 },
  { dia: "Qui", total: 91 },
  { dia: "Sex", total: 85 },
  { dia: "Sáb", total: 40 },
  { dia: "Dom", total: 22 },
];

export const indicadoresGerais = {
  conversasHoje: 132,
  taxaResolucaoSemHumano: 78,
  tempoMedioRespostaSegundos: 9,
  custoDoMesCentavos: 18450,
};
