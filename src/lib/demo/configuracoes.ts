// Dados de exemplo para as telas de Configurações e Equipe.

export const idiomas = ["Português (Brasil)", "Inglês (EUA)", "Espanhol"];
export const fusosHorarios = ["América/São Paulo (GMT-3)", "América/Manaus (GMT-4)", "América/Noronha (GMT-2)"];

export const meuPerfilDemo = {
  nome: "Ana Beatriz Souza",
  cargo: "Gerente de Atendimento",
  telefone: "(11) 98888-4321",
  idioma: idiomas[0],
  fuso: fusosHorarios[0],
  assinatura: "Att,\nAna Beatriz — Equipe de Atendimento",
};

export const sessoesAtivasDemo = [
  { id: "1", dispositivo: "Chrome — Windows", local: "São Paulo, SP", atividade: "Agora", atual: true },
  { id: "2", dispositivo: "App — iPhone 14", local: "São Paulo, SP", atividade: "há 2 horas", atual: false },
  { id: "3", dispositivo: "Edge — Windows", local: "Campinas, SP", atividade: "há 3 dias", atual: false },
];

export const eventosNotificacaoDemo = [
  { id: "novo_contato", label: "Novo contato recebido" },
  { id: "mensagem", label: "Nova mensagem no WhatsApp" },
  { id: "negocio_movido", label: "Negócio movido de estágio" },
  { id: "tarefa_vencendo", label: "Tarefa próxima do vencimento" },
  { id: "mencao", label: "Você foi mencionado" },
];

export const coresMarcaDemo = ["#7C3AED", "#DB2777", "#2563EB", "#059669", "#EA580C", "#0EA5E9"];

export const diasSemana = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export const horarioFuncionamentoDemo = diasSemana.map((dia, i) => ({
  dia,
  ativo: i < 5,
  inicio: "08:00",
  fim: "18:00",
}));

export const etiquetasDemo = [
  { id: "1", nome: "VIP", cor: "#DB2777", uso: 48 },
  { id: "2", nome: "Novo lead", cor: "#2563EB", uso: 132 },
  { id: "3", nome: "Aguardando pagamento", cor: "#EA580C", uso: 21 },
  { id: "4", nome: "Cliente recorrente", cor: "#059669", uso: 76 },
  { id: "5", nome: "Perdido", cor: "#71717A", uso: 15 },
];

export const modelosDemo = [
  {
    id: "1",
    nome: "Boas-vindas por e-mail",
    canal: "E-mail",
    assunto: "Bem-vindo(a) à nossa loja!",
    preview: "Olá {{nome}}, que bom ter você com a gente! Qualquer dúvida, estamos por aqui.",
  },
  {
    id: "2",
    nome: "Nota interna — follow-up",
    canal: "Nota interna",
    assunto: "Lembrete de retorno",
    preview: "Cliente pediu retorno em 3 dias sobre a proposta enviada.",
  },
  {
    id: "3",
    nome: "Cobrança amigável",
    canal: "E-mail",
    assunto: "Seu pagamento está pendente",
    preview: "Olá {{nome}}, notamos que o pagamento do pedido {{pedido}} ainda não foi confirmado.",
  },
];

export const tiposCompromissoDemo = [
  { id: "1", nome: "Reunião comercial", duracao: 30 },
  { id: "2", nome: "Demonstração do produto", duracao: 45 },
  { id: "3", nome: "Suporte técnico", duracao: 20 },
];

export const funisDemo = ["Vendas — Padrão", "Pós-venda", "Suporte técnico"];

export const camposObrigatoriosDemo = [
  { estagio: "Novo lead", campos: ["Nome", "Telefone"] },
  { estagio: "Qualificação", campos: ["E-mail", "Origem"] },
  { estagio: "Proposta", campos: ["Valor estimado", "Data prevista de fechamento"] },
  { estagio: "Fechamento", campos: ["Forma de pagamento"] },
];

export const eventosConversaoDemo = [
  { id: "1", nome: "Lead capturado", estagio: "Novo lead", valorPadrao: 0 },
  { id: "2", nome: "Oportunidade qualificada", estagio: "Qualificação", valorPadrao: 0 },
  { id: "3", nome: "Venda concluída", estagio: "Fechamento", valorPadrao: 25000 },
];

export const campanhasMetaAdsDemo = [
  { id: "1", nome: "Campanha — Dia das Mães", status: "Ativa", leads: 214, custoPorLead: 8.4 },
  { id: "2", nome: "Campanha — Remarketing carrinho", status: "Ativa", leads: 89, custoPorLead: 5.9 },
  { id: "3", nome: "Campanha — Institucional", status: "Pausada", leads: 34, custoPorLead: 12.1 },
];

export const chavesApiDemo = [
  {
    id: "1",
    nome: "Integração planilhas",
    prefixo: "sk_live_4f2a",
    criadaEm: "12/03/2025",
    ultimoUso: "há 2 horas",
    permissoes: "Leitura",
  },
  {
    id: "2",
    nome: "App interno de relatórios",
    prefixo: "sk_live_9b71",
    criadaEm: "02/01/2025",
    ultimoUso: "há 5 dias",
    permissoes: "Leitura e escrita",
  },
];

export const webhooksDemo = [
  {
    id: "1",
    url: "https://exemplo.com/webhooks/crm",
    eventos: ["Novo contato", "Negócio ganho"],
    status: "Ativo",
  },
  {
    id: "2",
    url: "https://sistema-interno.exemplo.com/hook",
    eventos: ["Nova mensagem"],
    status: "Inativo",
  },
];

export const historicoEntregasWebhookDemo = [
  { id: "1", evento: "Novo contato", data: "18/05/2025 10:12", codigo: 200 },
  { id: "2", evento: "Negócio ganho", data: "17/05/2025 16:40", codigo: 200 },
  { id: "3", evento: "Nova mensagem", data: "17/05/2025 09:02", codigo: 500 },
];

export const conexoesDemo = [
  { id: "whatsapp", nome: "WhatsApp", descricao: "Atendimento via gateway ou canal oficial.", conectado: true },
  { id: "meta-ads", nome: "Meta Ads", descricao: "Campanhas do Facebook e Instagram.", conectado: true },
  { id: "google-calendar", nome: "Google Agenda", descricao: "Sincronize compromissos automaticamente.", conectado: false },
  { id: "email", nome: "E-mail", descricao: "Envio de mensagens e modelos por e-mail.", conectado: true },
  { id: "planilhas", nome: "Planilhas", descricao: "Exportação e importação de dados.", conectado: false },
];

export const historicoVersoesDemo = [
  { versao: "2.4.0", data: "10/05/2025", destaque: "Nova tela de conversões e melhorias no funil." },
  { versao: "2.3.1", data: "22/04/2025", destaque: "Correções de estabilidade no WhatsApp." },
  { versao: "2.3.0", data: "05/04/2025", destaque: "Webhooks e chaves de API." },
];

export const novidadesVersaoAtualDemo = [
  "Nova tela de conversões com mapeamento de estágios",
  "Melhorias de performance na fila de atendimento",
  "Correções de pequenos ajustes visuais",
];

export const cargosPermissoesDemo = [
  { cargo: "Administrador", descricao: "Acesso total, incluindo configurações e financeiro." },
  { cargo: "Gerente", descricao: "Gerencia equipe, funis e relatórios, sem acesso a chaves de API." },
  { cargo: "Atendente", descricao: "Atende conversas e gerencia seus próprios contatos e tarefas." },
  { cargo: "Visualizador", descricao: "Apenas visualiza relatórios e o funil de vendas." },
];

export const convitesPendentesDemo = [
  { id: "1", nome: "Carlos Eduardo", email: "carlos@exemplo.com", cargo: "Atendente", enviadoEm: "há 2 dias" },
  { id: "2", nome: "Marina Alves", email: "marina@exemplo.com", cargo: "Gerente", enviadoEm: "há 5 horas" },
];
