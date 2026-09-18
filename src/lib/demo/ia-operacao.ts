// Dados de exemplo do bloco Inteligência Artificial (operação: propostas, follow-ups,
// execuções, conversas, provedores, consumo e evolução). Somente para fins visuais.

// ---------- Propostas ----------
export type StatusProposta = "rascunho" | "enviada" | "aceita" | "recusada";

export type ItemProposta = {
  descricao: string;
  quantidade: number;
  valorUnitarioCentavos: number;
};

export type Proposta = {
  id: string;
  contato: string;
  status: StatusProposta;
  data: string;
  itens: ItemProposta[];
};

export function totalPropostaCentavos(p: Proposta) {
  return p.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnitarioCentavos, 0);
}

export const PROPOSTAS: Proposta[] = [
  {
    id: "prop-1",
    contato: "Marina Souza",
    status: "enviada",
    data: "2024-05-28",
    itens: [
      { descricao: "Kit brincos folheados a ouro", quantidade: 2, valorUnitarioCentavos: 8900 },
      { descricao: "Colar ponto de luz", quantidade: 1, valorUnitarioCentavos: 15900 },
    ],
  },
  {
    id: "prop-2",
    contato: "Rodrigo Teixeira",
    status: "aceita",
    data: "2024-05-26",
    itens: [{ descricao: "Pulseira riviera prata 925", quantidade: 3, valorUnitarioCentavos: 12900 }],
  },
  {
    id: "prop-3",
    contato: "Fernanda Lopes",
    status: "rascunho",
    data: "2024-05-30",
    itens: [
      { descricao: "Anel solitário zircônia", quantidade: 1, valorUnitarioCentavos: 22900 },
      { descricao: "Kit presente embalagem", quantidade: 1, valorUnitarioCentavos: 1900 },
    ],
  },
  {
    id: "prop-4",
    contato: "Diego Martins",
    status: "recusada",
    data: "2024-05-20",
    itens: [{ descricao: "Relógio minimalista aço", quantidade: 1, valorUnitarioCentavos: 34900 }],
  },
  {
    id: "prop-5",
    contato: "Juliana Prado",
    status: "enviada",
    data: "2024-05-29",
    itens: [
      { descricao: "Conjunto semijoia banhada", quantidade: 1, valorUnitarioCentavos: 27900 },
      { descricao: "Frete expresso", quantidade: 1, valorUnitarioCentavos: 1500 },
    ],
  },
];

// ---------- Follow-up automático ----------
export type StatusRegua = "ativa" | "pausada" | "rascunho";

export type PassoRegua = {
  esperaDias: number;
  mensagem: string;
  saiSeResponder: boolean;
};

export type ReguaFollowup = {
  id: string;
  nome: string;
  gatilho: string;
  status: StatusRegua;
  passos: PassoRegua[];
  contatosInscritos: number;
};

export const REGUAS_FOLLOWUP: ReguaFollowup[] = [
  {
    id: "regua-1",
    nome: "Carrinho abandonado",
    gatilho: "Cliente não finaliza pedido em 2h",
    status: "ativa",
    contatosInscritos: 34,
    passos: [
      { esperaDias: 0, mensagem: "Notei que você deixou itens no carrinho, posso ajudar a finalizar?", saiSeResponder: true },
      { esperaDias: 1, mensagem: "Ainda dá tempo de garantir seus produtos com 10% de desconto.", saiSeResponder: true },
      { esperaDias: 3, mensagem: "Última chance: seu desconto expira hoje.", saiSeResponder: true },
    ],
  },
  {
    id: "regua-2",
    nome: "Proposta sem resposta",
    gatilho: "Proposta enviada sem retorno",
    status: "ativa",
    contatosInscritos: 12,
    passos: [
      { esperaDias: 2, mensagem: "Oi! Conseguiu ver a proposta que te enviei?", saiSeResponder: true },
      { esperaDias: 5, mensagem: "Fico à disposição para tirar dúvidas sobre a proposta.", saiSeResponder: true },
    ],
  },
  {
    id: "regua-3",
    nome: "Pós-venda 30 dias",
    gatilho: "Compra concluída há 30 dias",
    status: "pausada",
    contatosInscritos: 8,
    passos: [
      { esperaDias: 30, mensagem: "Como está sendo a experiência com sua compra?", saiSeResponder: true },
      { esperaDias: 33, mensagem: "Separei novidades que combinam com o que você levou.", saiSeResponder: false },
    ],
  },
  {
    id: "regua-4",
    nome: "Reativação de inativos",
    gatilho: "Sem contato há 60 dias",
    status: "rascunho",
    contatosInscritos: 0,
    passos: [{ esperaDias: 0, mensagem: "Sentimos sua falta! Que tal dar uma olhada nos lançamentos?", saiSeResponder: true }],
  },
];

export type SituacaoInscricao = "em_andamento" | "pausada" | "concluida" | "saiu_por_resposta";

export type InscricaoRegua = {
  id: string;
  contato: string;
  reguaId: string;
  passoAtual: number;
  proximoEnvio: string;
  situacao: SituacaoInscricao;
};

export const INSCRICOES_FOLLOWUP: InscricaoRegua[] = [
  { id: "insc-1", contato: "Marina Souza", reguaId: "regua-1", passoAtual: 1, proximoEnvio: "2024-06-01", situacao: "em_andamento" },
  { id: "insc-2", contato: "Camila Duarte", reguaId: "regua-1", passoAtual: 2, proximoEnvio: "2024-06-03", situacao: "em_andamento" },
  { id: "insc-3", contato: "Rodrigo Teixeira", reguaId: "regua-2", passoAtual: 1, proximoEnvio: "2024-05-31", situacao: "saiu_por_resposta" },
  { id: "insc-4", contato: "Fernanda Lopes", reguaId: "regua-2", passoAtual: 2, proximoEnvio: "2024-06-02", situacao: "em_andamento" },
  { id: "insc-5", contato: "Diego Martins", reguaId: "regua-3", passoAtual: 1, proximoEnvio: "2024-06-05", situacao: "pausada" },
  { id: "insc-6", contato: "Juliana Prado", reguaId: "regua-1", passoAtual: 3, proximoEnvio: "-", situacao: "concluida" },
];

// ---------- Execuções ----------
export type ResultadoExecucao = "sucesso" | "parcial" | "falhou";

export type MensagemExecucao = {
  autor: "cliente" | "ia" | "sistema";
  texto: string;
  hora: string;
};

export type PassoExecucao = {
  titulo: string;
  detalhe: string;
};

export type Execucao = {
  id: string;
  data: string;
  agente: string;
  contato: string;
  acao: string;
  duracaoSegundos: number;
  resultado: ResultadoExecucao;
  custoEstimadoCentavos: number;
  passos: PassoExecucao[];
  mensagens: MensagemExecucao[];
};

export const EXECUCOES: Execucao[] = [
  {
    id: "exec-1",
    data: "2024-05-30 09:12",
    agente: "Agente de Vendas",
    contato: "Marina Souza",
    acao: "Gerou proposta comercial",
    duracaoSegundos: 42,
    resultado: "sucesso",
    custoEstimadoCentavos: 18,
    passos: [
      { titulo: "Entendeu a intenção", detalhe: "Cliente pediu preço de kit de brincos e colar." },
      { titulo: "Consultou catálogo", detalhe: "Buscou itens compatíveis com o pedido." },
      { titulo: "Montou proposta", detalhe: "Gerou proposta com 2 itens e total calculado." },
    ],
    mensagens: [
      { autor: "cliente", texto: "Quanto fica o kit de brincos com o colar?", hora: "09:11" },
      { autor: "ia", texto: "Preparei uma proposta para você, já te envio!", hora: "09:12" },
    ],
  },
  {
    id: "exec-2",
    data: "2024-05-30 08:40",
    agente: "Agente de Suporte",
    contato: "Rodrigo Teixeira",
    acao: "Consultou status de pedido",
    duracaoSegundos: 15,
    resultado: "sucesso",
    custoEstimadoCentavos: 6,
    passos: [
      { titulo: "Identificou pedido", detalhe: "Localizou pedido #4521 pelo número de telefone." },
      { titulo: "Respondeu cliente", detalhe: "Informou previsão de entrega." },
    ],
    mensagens: [
      { autor: "cliente", texto: "Meu pedido já saiu para entrega?", hora: "08:39" },
      { autor: "ia", texto: "Ainda não, a previsão é chegar até quinta-feira.", hora: "08:40" },
    ],
  },
  {
    id: "exec-3",
    data: "2024-05-29 17:05",
    agente: "Agente de Follow-up",
    contato: "Fernanda Lopes",
    acao: "Enviou lembrete de proposta",
    duracaoSegundos: 8,
    resultado: "sucesso",
    custoEstimadoCentavos: 4,
    passos: [{ titulo: "Disparou mensagem", detalhe: "Régua 'Proposta sem resposta', passo 1." }],
    mensagens: [{ autor: "ia", texto: "Oi! Conseguiu ver a proposta que te enviei?", hora: "17:05" }],
  },
  {
    id: "exec-4",
    data: "2024-05-29 14:22",
    agente: "Agente de Vendas",
    contato: "Diego Martins",
    acao: "Tentou identificar produto por foto",
    duracaoSegundos: 30,
    resultado: "parcial",
    custoEstimadoCentavos: 22,
    passos: [
      { titulo: "Recebeu imagem", detalhe: "Cliente enviou foto de um relógio." },
      { titulo: "Não encontrou correspondência exata", detalhe: "Sugeriu itens parecidos do catálogo." },
    ],
    mensagens: [
      { autor: "cliente", texto: "Vocês têm esse relógio aqui?", hora: "14:21" },
      { autor: "ia", texto: "Não encontrei esse modelo exato, mas tenho opções parecidas!", hora: "14:22" },
    ],
  },
  {
    id: "exec-5",
    data: "2024-05-28 11:50",
    agente: "Agente de Suporte",
    contato: "Juliana Prado",
    acao: "Transferiu para humano",
    duracaoSegundos: 20,
    resultado: "falhou",
    custoEstimadoCentavos: 9,
    passos: [
      { titulo: "Recebeu reclamação", detalhe: "Cliente relatou item com defeito." },
      { titulo: "Não conseguiu resolver", detalhe: "Encaminhou para atendimento humano." },
    ],
    mensagens: [
      { autor: "cliente", texto: "O colar veio com o fecho quebrado.", hora: "11:49" },
      { autor: "ia", texto: "Sinto muito por isso! Vou te transferir para um atendente resolver.", hora: "11:50" },
      { autor: "sistema", texto: "Conversa transferida para Camila Duarte.", hora: "11:50" },
    ],
  },
];

export const AGENTES_FILTRO = ["Agente de Vendas", "Agente de Suporte", "Agente de Follow-up"];

// ---------- Conversas da IA ----------
export type AutorMensagem = "cliente" | "ia" | "humano";

export type MensagemConversa = {
  autor: AutorMensagem;
  texto: string;
  hora: string;
};

export type ConversaIA = {
  id: string;
  contato: string;
  ultimaMensagem: string;
  hora: string;
  iaAtiva: boolean;
  mensagens: MensagemConversa[];
  intencao: string;
  dadosColetados: { rotulo: string; valor: string }[];
  proximaAcao: string;
};

export const CONVERSAS_IA: ConversaIA[] = [
  {
    id: "conv-ia-1",
    contato: "Marina Souza",
    ultimaMensagem: "Preparei uma proposta para você, já te envio!",
    hora: "09:12",
    iaAtiva: true,
    intencao: "Pedido de orçamento",
    dadosColetados: [
      { rotulo: "Produtos de interesse", valor: "Kit de brincos, colar ponto de luz" },
      { rotulo: "Forma de pagamento", valor: "Ainda não informada" },
    ],
    proximaAcao: "Enviar proposta e aguardar resposta",
    mensagens: [
      { autor: "cliente", texto: "Oi, quanto fica o kit de brincos com o colar?", hora: "09:11" },
      { autor: "ia", texto: "Preparei uma proposta para você, já te envio!", hora: "09:12" },
    ],
  },
  {
    id: "conv-ia-2",
    contato: "Rodrigo Teixeira",
    ultimaMensagem: "Ainda não, a previsão é chegar até quinta-feira.",
    hora: "08:40",
    iaAtiva: true,
    intencao: "Consulta de status de pedido",
    dadosColetados: [{ rotulo: "Número do pedido", valor: "#4521" }],
    proximaAcao: "Confirmar entrega quando pedido sair para transporte",
    mensagens: [
      { autor: "cliente", texto: "Meu pedido já saiu para entrega?", hora: "08:39" },
      { autor: "ia", texto: "Ainda não, a previsão é chegar até quinta-feira.", hora: "08:40" },
    ],
  },
  {
    id: "conv-ia-3",
    contato: "Juliana Prado",
    ultimaMensagem: "Conversa transferida para Camila Duarte.",
    hora: "11:50",
    iaAtiva: false,
    intencao: "Reclamação de produto com defeito",
    dadosColetados: [{ rotulo: "Produto", valor: "Colar com fecho quebrado" }],
    proximaAcao: "Aguardar atendimento humano",
    mensagens: [
      { autor: "cliente", texto: "O colar veio com o fecho quebrado.", hora: "11:49" },
      { autor: "ia", texto: "Sinto muito por isso! Vou te transferir para um atendente resolver.", hora: "11:50" },
      { autor: "humano", texto: "Oi Juliana, aqui é a Camila! Vamos resolver isso rapidinho.", hora: "11:55" },
    ],
  },
  {
    id: "conv-ia-4",
    contato: "Diego Martins",
    ultimaMensagem: "Não encontrei esse modelo exato, mas tenho opções parecidas!",
    hora: "14:22",
    iaAtiva: true,
    intencao: "Identificação de produto",
    dadosColetados: [{ rotulo: "Categoria", valor: "Relógios" }],
    proximaAcao: "Sugerir alternativas do catálogo",
    mensagens: [
      { autor: "cliente", texto: "Vocês têm esse relógio aqui?", hora: "14:21" },
      { autor: "ia", texto: "Não encontrei esse modelo exato, mas tenho opções parecidas!", hora: "14:22" },
    ],
  },
];

// ---------- Provedores e chaves ----------
export type TipoTarefaIA = "conversa" | "resumo" | "transcricao";

export type ProvedorIA = {
  id: string;
  nome: string;
  descricao: string;
  padraoPlataforma: boolean;
  usaChavePropria: boolean;
  chaveMascarada: string;
  modelosPorTarefa: Record<TipoTarefaIA, string>;
  modelosDisponiveis: string[];
};

export const PROVEDORES_IA: ProvedorIA[] = [
  {
    id: "prov-1",
    nome: "Provedor Padrão da Plataforma",
    descricao: "Já vem ativo e não exige configuração. Ideal para começar rapidamente.",
    padraoPlataforma: true,
    usaChavePropria: false,
    chaveMascarada: "",
    modelosPorTarefa: { conversa: "Modelo Padrão", resumo: "Modelo Padrão", transcricao: "Modelo Padrão" },
    modelosDisponiveis: ["Modelo Padrão"],
  },
  {
    id: "prov-2",
    nome: "OpenAI",
    descricao: "Use sua própria chave para ter controle total sobre custo e limites.",
    padraoPlataforma: false,
    usaChavePropria: false,
    chaveMascarada: "sk-••••••••••••4f2a",
    modelosPorTarefa: { conversa: "GPT-4o", resumo: "GPT-4o mini", transcricao: "Whisper" },
    modelosDisponiveis: ["GPT-4o", "GPT-4o mini", "Whisper"],
  },
  {
    id: "prov-3",
    nome: "Anthropic",
    descricao: "Alternativa com chave própria para tarefas de conversa e resumo.",
    padraoPlataforma: false,
    usaChavePropria: false,
    chaveMascarada: "sk-ant-••••••••••9c31",
    modelosPorTarefa: { conversa: "Claude 3.5 Sonnet", resumo: "Claude 3 Haiku", transcricao: "Não suportado" },
    modelosDisponiveis: ["Claude 3.5 Sonnet", "Claude 3 Haiku"],
  },
  {
    id: "prov-4",
    nome: "Google",
    descricao: "Use modelos Gemini com sua própria chave de API.",
    padraoPlataforma: false,
    usaChavePropria: false,
    chaveMascarada: "AIza••••••••••••7e10",
    modelosPorTarefa: { conversa: "Gemini 1.5 Pro", resumo: "Gemini 1.5 Flash", transcricao: "Gemini 1.5 Flash" },
    modelosDisponiveis: ["Gemini 1.5 Pro", "Gemini 1.5 Flash"],
  },
];

// ---------- Consumo ----------
export type ConsumoDiario = { dia: string; mensagens: number; tokens: number };

export const CONSUMO_DIARIO: ConsumoDiario[] = [
  { dia: "01/05", mensagens: 120, tokens: 42000 },
  { dia: "05/05", mensagens: 145, tokens: 51000 },
  { dia: "10/05", mensagens: 98, tokens: 33000 },
  { dia: "15/05", mensagens: 176, tokens: 61000 },
  { dia: "20/05", mensagens: 210, tokens: 72000 },
  { dia: "25/05", mensagens: 188, tokens: 66000 },
  { dia: "30/05", mensagens: 240, tokens: 85000 },
];

export type ConsumoPorAgente = { agente: string; mensagens: number; tokens: number; custoCentavos: number };

export const CONSUMO_POR_AGENTE: ConsumoPorAgente[] = [
  { agente: "Agente de Vendas", mensagens: 1820, tokens: 612000, custoCentavos: 48600 },
  { agente: "Agente de Suporte", mensagens: 1340, tokens: 401000, custoCentavos: 31200 },
  { agente: "Agente de Follow-up", mensagens: 640, tokens: 158000, custoCentavos: 12400 },
];

export type ConsumoPorModelo = { modelo: string; mensagens: number; tokens: number; custoCentavos: number };

export const CONSUMO_POR_MODELO: ConsumoPorModelo[] = [
  { modelo: "Modelo Padrão", mensagens: 2600, tokens: 780000, custoCentavos: 0 },
  { modelo: "GPT-4o", mensagens: 820, tokens: 280000, custoCentavos: 62000 },
  { modelo: "GPT-4o mini", mensagens: 380, tokens: 111000, custoCentavos: 30200 },
];

export const LIMITE_MENSAL_PADRAO_CENTAVOS = 100000;
export const CUSTO_MES_ATUAL_CENTAVOS = 92200;
export const CUSTO_MES_ANTERIOR_CENTAVOS = 78400;
export const MENSAGENS_MES_ATUAL = 3800;
export const MENSAGENS_MES_ANTERIOR = 3210;
export const TOKENS_MES_ATUAL = 1171000;
export const TOKENS_MES_ANTERIOR = 986000;

// ---------- Evolução ----------
export type PontoEvolucao = {
  mes: string;
  taxaResolucao: number;
  satisfacao: number;
  transferenciasHumano: number;
  errosCorrigidos: number;
};

export const EVOLUCAO_MENSAL: PontoEvolucao[] = [
  { mes: "Jan", taxaResolucao: 68, satisfacao: 4.1, transferenciasHumano: 42, errosCorrigidos: 3 },
  { mes: "Fev", taxaResolucao: 71, satisfacao: 4.2, transferenciasHumano: 38, errosCorrigidos: 5 },
  { mes: "Mar", taxaResolucao: 75, satisfacao: 4.3, transferenciasHumano: 33, errosCorrigidos: 4 },
  { mes: "Abr", taxaResolucao: 79, satisfacao: 4.5, transferenciasHumano: 27, errosCorrigidos: 6 },
  { mes: "Mai", taxaResolucao: 84, satisfacao: 4.6, transferenciasHumano: 21, errosCorrigidos: 7 },
];

export type MelhoriaAplicada = {
  id: string;
  data: string;
  titulo: string;
  descricao: string;
  agente: string;
};

export const MELHORIAS_APLICADAS: MelhoriaAplicada[] = [
  {
    id: "mel-1",
    data: "2024-05-27",
    titulo: "Ensinado a reconhecer pedidos de troca",
    descricao: "Agente de Suporte passou a identificar pedidos de troca e abrir o fluxo correto.",
    agente: "Agente de Suporte",
  },
  {
    id: "mel-2",
    data: "2024-05-18",
    titulo: "Ajuste no tom de voz das propostas",
    descricao: "Mensagens de proposta ficaram mais objetivas, reduzindo abandono.",
    agente: "Agente de Vendas",
  },
  {
    id: "mel-3",
    data: "2024-05-05",
    titulo: "Correção em cálculo de frete",
    descricao: "Corrigido erro que somava frete duas vezes em pedidos combinados.",
    agente: "Agente de Vendas",
  },
];

export type VersaoInstrucoes = {
  versao: string;
  data: string;
  agente: string;
  resumo: string;
};

export const VERSOES_INSTRUCOES: VersaoInstrucoes[] = [
  { versao: "v3", data: "2024-05-27", agente: "Agente de Suporte", resumo: "Inclui fluxo de trocas e devoluções." },
  { versao: "v2", data: "2024-04-30", agente: "Agente de Suporte", resumo: "Ajuste de tom mais empático em reclamações." },
  { versao: "v1", data: "2024-03-15", agente: "Agente de Suporte", resumo: "Versão inicial das instruções." },
];
