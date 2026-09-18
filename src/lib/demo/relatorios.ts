// Dados de exemplo para os relatórios, painel e privacidade (LGPD).
// Sem chamadas externas — apenas para compor a fase visual.

export type SeverityLevel = "alta" | "media" | "baixa";

// ---------- Painel ----------

export const painelIndicadoresHoje = {
  conversasAbertas: 18,
  negociosAbertos: 32,
  negociosValorCents: 18420000,
  tarefasHoje: 7,
  compromissosHoje: 4,
};

export const conversasPorDia = [
  { dia: "Seg", conversas: 22 },
  { dia: "Ter", conversas: 28 },
  { dia: "Qua", conversas: 19 },
  { dia: "Qui", conversas: 31 },
  { dia: "Sex", conversas: 26 },
  { dia: "Sáb", conversas: 9 },
  { dia: "Dom", conversas: 4 },
];

export const funilResumo = [
  { estagio: "Novo contato", quantidade: 24, cor: "var(--chart-1)" },
  { estagio: "Qualificação", quantidade: 17, cor: "var(--chart-2)" },
  { estagio: "Proposta", quantidade: 11, cor: "var(--chart-3)" },
  { estagio: "Negociação", quantidade: 6, cor: "var(--chart-4)" },
  { estagio: "Fechamento", quantidade: 3, cor: "var(--chart-5)" },
];

export const proximosCompromissos = [
  { id: "c1", titulo: "Ligação com Padaria da Praça", horario: "09:30", pessoa: "Fernanda Souza" },
  { id: "c2", titulo: "Reunião de apresentação — Ótica Vieira", horario: "11:00", pessoa: "Carlos Lima" },
  { id: "c3", titulo: "Follow-up proposta — Studio Bela", horario: "14:15", pessoa: "Fernanda Souza" },
  { id: "c4", titulo: "Visita técnica — Mercado Bom Preço", horario: "16:00", pessoa: "João Pedro" },
];

export const tarefasAtrasadas = [
  { id: "t1", titulo: "Enviar contrato para Loja Vitória", diasAtraso: 3, responsavel: "Carlos Lima" },
  { id: "t2", titulo: "Retornar ligação de Marcos Andrade", diasAtraso: 1, responsavel: "Fernanda Souza" },
  { id: "t3", titulo: "Atualizar cadastro de fornecedor", diasAtraso: 5, responsavel: "João Pedro" },
];

export const atividadeRecenteEquipe = [
  { id: "a1", pessoa: "Fernanda Souza", acao: "moveu o negócio \"Loja Vitória\" para Proposta", horario: "há 12 min" },
  { id: "a2", pessoa: "Carlos Lima", acao: "concluiu a tarefa \"Enviar orçamento\"", horario: "há 34 min" },
  { id: "a3", pessoa: "João Pedro", acao: "cadastrou o contato \"Studio Bela Estética\"", horario: "há 1 h" },
  { id: "a4", pessoa: "Fernanda Souza", acao: "respondeu 5 conversas no WhatsApp", horario: "há 2 h" },
  { id: "a5", pessoa: "Ana Beatriz", acao: "criou um novo compromisso na agenda", horario: "há 3 h" },
];

// ---------- Métricas ----------

export const periodosDisponiveis = [
  { valor: "7d", rotulo: "Últimos 7 dias" },
  { valor: "30d", rotulo: "Últimos 30 dias" },
  { valor: "90d", rotulo: "Últimos 90 dias" },
  { valor: "ano", rotulo: "Este ano" },
];

export const indicadoresAtendimento = {
  tempoPrimeiraRespostaMin: 6,
  tempoResolucaoHoras: 4.2,
  volumePorCanal: [
    { canal: "WhatsApp", conversas: 214 },
    { canal: "Instagram", conversas: 96 },
    { canal: "E-mail", conversas: 41 },
    { canal: "Telefone", conversas: 28 },
  ],
};

export const conversasPorAtendente = [
  { atendente: "Fernanda Souza", conversas: 98, tempoRespostaMin: 4 },
  { atendente: "Carlos Lima", conversas: 76, tempoRespostaMin: 7 },
  { atendente: "João Pedro", conversas: 64, tempoRespostaMin: 9 },
  { atendente: "Ana Beatriz", conversas: 41, tempoRespostaMin: 5 },
];

export const indicadoresVendas = {
  negociosCriados: 58,
  negociosGanhos: 21,
  negociosPerdidos: 9,
  taxaConversao: 36,
  ticketMedioCents: 187000,
  valorNoFunilCents: 18420000,
};

export const vendasPorSemana = [
  { semana: "Sem 1", ganhos: 4, perdidos: 2 },
  { semana: "Sem 2", ganhos: 6, perdidos: 1 },
  { semana: "Sem 3", ganhos: 5, perdidos: 3 },
  { semana: "Sem 4", ganhos: 6, perdidos: 3 },
];

export const desempenhoPorAtendente = [
  { atendente: "Fernanda Souza", negociosGanhos: 9, valorGeradoCents: 6120000, taxaConversao: 42 },
  { atendente: "Carlos Lima", negociosGanhos: 6, valorGeradoCents: 4380000, taxaConversao: 31 },
  { atendente: "João Pedro", negociosGanhos: 4, valorGeradoCents: 2650000, taxaConversao: 28 },
  { atendente: "Ana Beatriz", negociosGanhos: 2, valorGeradoCents: 1310000, taxaConversao: 24 },
];

// ---------- Análise ----------

export const evolucaoMensal = [
  { mes: "Mai", negocios: 34, valorCents: 9800000 },
  { mes: "Jun", negocios: 41, valorCents: 12200000 },
  { mes: "Jul", negocios: 38, valorCents: 11100000 },
  { mes: "Ago", negocios: 47, valorCents: 14600000 },
  { mes: "Set", negocios: 52, valorCents: 16300000 },
  { mes: "Out", negocios: 58, valorCents: 18420000 },
];

export const comparacaoPeriodos = {
  atual: { nome: "Este mês", negocios: 58, valorCents: 18420000, conversao: 36 },
  anterior: { nome: "Mês anterior", negocios: 52, valorCents: 16300000, conversao: 33 },
};

export const motivosPerda = [
  { motivo: "Preço acima do esperado", quantidade: 14 },
  { motivo: "Sem retorno do contato", quantidade: 11 },
  { motivo: "Escolheu concorrente", quantidade: 7 },
  { motivo: "Fora do momento de compra", quantidade: 5 },
  { motivo: "Não era o público-alvo", quantidade: 3 },
];

export const origemContatos = [
  { origem: "Indicação", quantidade: 42, cor: "var(--chart-1)" },
  { origem: "Instagram", quantidade: 35, cor: "var(--chart-2)" },
  { origem: "WhatsApp direto", quantidade: 28, cor: "var(--chart-3)" },
  { origem: "Site", quantidade: 19, cor: "var(--chart-4)" },
  { origem: "Evento", quantidade: 8, cor: "var(--chart-5)" },
];

export const desempenhoPorEtiqueta = [
  { etiqueta: "Varejo", negocios: 26, valorCents: 6800000 },
  { etiqueta: "Serviços", negocios: 19, valorCents: 5400000 },
  { etiqueta: "Alimentação", negocios: 14, valorCents: 3100000 },
  { etiqueta: "Saúde e beleza", negocios: 11, valorCents: 3120000 },
];

// Grade de calor de horários: linhas = dias, colunas = faixa horária (0 a 1 = intensidade)
export const mapaHorarios = {
  dias: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  horarios: ["8h", "10h", "12h", "14h", "16h", "18h", "20h"],
  intensidade: [
    [0.2, 0.5, 0.3, 0.6, 0.7, 0.4, 0.1],
    [0.3, 0.6, 0.4, 0.7, 0.8, 0.5, 0.2],
    [0.2, 0.5, 0.35, 0.65, 0.75, 0.45, 0.15],
    [0.4, 0.7, 0.5, 0.8, 0.9, 0.6, 0.25],
    [0.35, 0.6, 0.45, 0.75, 0.85, 0.55, 0.3],
    [0.1, 0.2, 0.15, 0.3, 0.35, 0.4, 0.2],
  ],
};

// ---------- Radar ----------

export type AlertaRadar = {
  id: string;
  categoria: string;
  gravidade: SeverityLevel;
  titulo: string;
  explicacao: string;
  acaoSugerida: string;
};

export const alertasRadar: AlertaRadar[] = [
  {
    id: "r1",
    categoria: "Conversa sem resposta",
    gravidade: "alta",
    titulo: "Marcos Andrade está sem resposta há 3 dias",
    explicacao: "O cliente mandou uma mensagem no WhatsApp perguntando sobre o orçamento e ninguém respondeu ainda.",
    acaoSugerida: "Responder agora e verificar se o orçamento já foi enviado.",
  },
  {
    id: "r2",
    categoria: "Negócio parado",
    gravidade: "media",
    titulo: "\"Loja Vitória\" está no mesmo estágio há 12 dias",
    explicacao: "O negócio está parado em Proposta bem mais tempo que a média dos outros negócios ganhos.",
    acaoSugerida: "Ligar para o cliente e entender se falta alguma informação para avançar.",
  },
  {
    id: "r3",
    categoria: "Tarefa atrasada",
    gravidade: "alta",
    titulo: "Atualização de cadastro de fornecedor está atrasada há 5 dias",
    explicacao: "Essa tarefa era importante para fechar a compra do mês e ainda não foi concluída.",
    acaoSugerida: "Concluir a tarefa hoje ou reatribuir para outra pessoa da equipe.",
  },
  {
    id: "r4",
    categoria: "Contato sem retorno",
    gravidade: "media",
    titulo: "Studio Bela Estética não recebe contato há 9 dias",
    explicacao: "Esse contato demonstrou interesse recentemente, mas ninguém deu continuidade à conversa.",
    acaoSugerida: "Enviar uma mensagem de acompanhamento com uma oferta ou novidade.",
  },
  {
    id: "r5",
    categoria: "Cliente em risco",
    gravidade: "alta",
    titulo: "Mercado Bom Preço reduziu o volume de pedidos",
    explicacao: "O cliente costumava comprar toda semana e não faz um pedido há quase um mês.",
    acaoSugerida: "Agendar uma visita ou ligação para entender o que mudou.",
  },
  {
    id: "r6",
    categoria: "Negócio parado",
    gravidade: "baixa",
    titulo: "\"Ótica Vieira\" está há 6 dias em Qualificação",
    explicacao: "Ainda dentro do tempo esperado, mas vale um lembrete para não esfriar.",
    acaoSugerida: "Enviar um lembrete amigável perguntando se restam dúvidas.",
  },
];

// ---------- Auditoria ----------

export type RegistroAuditoria = {
  id: string;
  dataHora: string;
  pessoa: string;
  acao: string;
  tipo: "criação" | "edição" | "exclusão" | "acesso";
  itemAfetado: string;
  origem: string;
  alteracoes?: { campo: string; antes: string; depois: string }[];
};

export const registrosAuditoria: RegistroAuditoria[] = [
  {
    id: "aud1",
    dataHora: "2024-10-14 09:12",
    pessoa: "Fernanda Souza",
    acao: "Alterou dados do negócio",
    tipo: "edição",
    itemAfetado: "Negócio — Loja Vitória",
    origem: "Painel web",
    alteracoes: [
      { campo: "Estágio", antes: "Qualificação", depois: "Proposta" },
      { campo: "Valor", antes: "R$ 3.200,00", depois: "R$ 3.850,00" },
    ],
  },
  {
    id: "aud2",
    dataHora: "2024-10-14 08:40",
    pessoa: "Carlos Lima",
    acao: "Excluiu tarefa",
    tipo: "exclusão",
    itemAfetado: "Tarefa — Enviar catálogo",
    origem: "Painel web",
  },
  {
    id: "aud3",
    dataHora: "2024-10-13 17:55",
    pessoa: "João Pedro",
    acao: "Cadastrou novo contato",
    tipo: "criação",
    itemAfetado: "Contato — Studio Bela Estética",
    origem: "Painel web",
  },
  {
    id: "aud4",
    dataHora: "2024-10-13 15:21",
    pessoa: "Ana Beatriz",
    acao: "Acessou dados de titular",
    tipo: "acesso",
    itemAfetado: "Contato — Marcos Andrade",
    origem: "Solicitação LGPD",
  },
  {
    id: "aud5",
    dataHora: "2024-10-12 11:03",
    pessoa: "Fernanda Souza",
    acao: "Alterou etapa do funil",
    tipo: "edição",
    itemAfetado: "Estágio — Proposta",
    origem: "Painel web",
    alteracoes: [{ campo: "Nome", antes: "Proposta enviada", depois: "Proposta" }],
  },
  {
    id: "aud6",
    dataHora: "2024-10-11 19:47",
    pessoa: "Carlos Lima",
    acao: "Editou dados de contato",
    tipo: "edição",
    itemAfetado: "Contato — Mercado Bom Preço",
    origem: "Painel web",
    alteracoes: [
      { campo: "Telefone", antes: "(11) 4002-0001", depois: "(11) 4002-0099" },
      { campo: "E-mail", antes: "contato@bompreco.com", depois: "compras@bompreco.com" },
    ],
  },
];

// ---------- Privacidade (LGPD) ----------

export type TipoSolicitacaoLGPD = "acesso" | "correção" | "exclusão" | "portabilidade";
export type StatusSolicitacaoLGPD = "aberto" | "em andamento" | "atendido" | "atrasado";

export type SolicitacaoLGPD = {
  id: string;
  tipo: TipoSolicitacaoLGPD;
  solicitante: string;
  contato: string;
  criadoEm: string;
  prazo: string;
  status: StatusSolicitacaoLGPD;
  historico: { data: string; evento: string }[];
};

export const indicadoresLGPD = {
  pedidosAbertos: 5,
  pedidosNoPrazo: 4,
  pedidosAtrasados: 1,
};

export const solicitacoesLGPD: SolicitacaoLGPD[] = [
  {
    id: "lgpd1",
    tipo: "acesso",
    solicitante: "Marcos Andrade",
    contato: "marcos.andrade@email.com",
    criadoEm: "2024-10-05",
    prazo: "2024-10-20",
    status: "em andamento",
    historico: [
      { data: "2024-10-05", evento: "Solicitação recebida pelo formulário do site." },
      { data: "2024-10-07", evento: "Equipe iniciou a separação dos dados do titular." },
    ],
  },
  {
    id: "lgpd2",
    tipo: "exclusão",
    solicitante: "Juliana Prado",
    contato: "juliana.prado@email.com",
    criadoEm: "2024-09-28",
    prazo: "2024-10-13",
    status: "atrasado",
    historico: [
      { data: "2024-09-28", evento: "Solicitação recebida por e-mail." },
      { data: "2024-10-02", evento: "Confirmada identidade da titular." },
    ],
  },
  {
    id: "lgpd3",
    tipo: "correção",
    solicitante: "Roberto Nunes",
    contato: "roberto.nunes@email.com",
    criadoEm: "2024-10-10",
    prazo: "2024-10-25",
    status: "aberto",
    historico: [{ data: "2024-10-10", evento: "Solicitação recebida pelo formulário do site." }],
  },
  {
    id: "lgpd4",
    tipo: "portabilidade",
    solicitante: "Studio Bela Estética",
    contato: "contato@studiobela.com",
    criadoEm: "2024-10-01",
    prazo: "2024-10-16",
    status: "atendido",
    historico: [
      { data: "2024-10-01", evento: "Solicitação recebida por e-mail." },
      { data: "2024-10-08", evento: "Dados exportados em formato CSV." },
      { data: "2024-10-09", evento: "Arquivo enviado à titular." },
    ],
  },
  {
    id: "lgpd5",
    tipo: "acesso",
    solicitante: "Patrícia Melo",
    contato: "patricia.melo@email.com",
    criadoEm: "2024-10-12",
    prazo: "2024-10-27",
    status: "aberto",
    historico: [{ data: "2024-10-12", evento: "Solicitação recebida pelo formulário do site." }],
  },
];

export const configuracaoRetencao = [
  { item: "Conversas de WhatsApp e Instagram", prazo: "24 meses após o último contato" },
  { item: "Dados de contatos sem negócios ativos", prazo: "18 meses de inatividade" },
  { item: "Registros de auditoria", prazo: "60 meses" },
  { item: "Documentos de propostas e contratos", prazo: "5 anos após o encerramento" },
];

export const configuracaoConsentimento = [
  { finalidade: "Contato comercial via WhatsApp", ativo: true },
  { finalidade: "Envio de novidades por e-mail", ativo: true },
  { finalidade: "Uso de dados para análises internas", ativo: true },
  { finalidade: "Compartilhamento com parceiros comerciais", ativo: false },
];
