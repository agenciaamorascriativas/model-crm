/** Dados de exemplo usados apenas nas telas visuais de apoio/entrada. */

export type PassoPrimeiros = {
  id: string;
  titulo: string;
  descricao: string;
  concluido: boolean;
  to: string;
  acao: string;
};

export const PASSOS_PRIMEIROS: PassoPrimeiros[] = [
  {
    id: "marca",
    titulo: "Personalize sua marca",
    descricao: "Defina o nome, logo e cores da empresa para que seus clientes reconheçam seu atendimento.",
    concluido: true,
    to: "/configuracoes",
    acao: "Ir para Configurações",
  },
  {
    id: "whatsapp",
    titulo: "Conecte o WhatsApp",
    descricao: "Ligue seu número ao CRM para começar a enviar e receber mensagens direto por aqui.",
    concluido: true,
    to: "/whatsapp",
    acao: "Ir para WhatsApp",
  },
  {
    id: "funil",
    titulo: "Monte seu funil de vendas",
    descricao: "Organize os estágios da jornada do cliente, do primeiro contato até o fechamento.",
    concluido: false,
    to: "/funil",
    acao: "Ir para Funil de Vendas",
  },
  {
    id: "equipe",
    titulo: "Convide sua equipe",
    descricao: "Adicione atendentes e defina permissões para distribuir as conversas com organização.",
    concluido: false,
    to: "/equipe",
    acao: "Ir para Equipe",
  },
  {
    id: "agenda",
    titulo: "Configure sua agenda",
    descricao: "Defina horários disponíveis para que seus clientes possam marcar compromissos sozinhos.",
    concluido: false,
    to: "/agenda",
    acao: "Ir para Agenda",
  },
  {
    id: "ia",
    titulo: "Ative a inteligência artificial",
    descricao: "Configure um agente de IA para responder dúvidas frequentes e qualificar contatos.",
    concluido: false,
    to: "/ia",
    acao: "Ir para IA",
  },
];

export type EmpresaAgendamento = {
  nome: string;
  descricao: string;
  fotoIniciais: string;
  endereco: string;
};

export const EMPRESA_AGENDAMENTO: EmpresaAgendamento = {
  nome: "Amoras Estética & Bem-Estar",
  descricao:
    "Cuidamos de você com carinho e profissionalismo. Agende seu horário abaixo e escolha o dia e serviço que preferir.",
  fotoIniciais: "AE",
  endereco: "Rua das Amoras, 123 — Centro",
};

export type TipoCompromisso = {
  id: string;
  nome: string;
  duracaoMin: number;
  descricao: string;
};

export const TIPOS_COMPROMISSO: TipoCompromisso[] = [
  { id: "avaliacao", nome: "Avaliação inicial", duracaoMin: 30, descricao: "Conversa para entender suas necessidades." },
  { id: "sessao", nome: "Sessão completa", duracaoMin: 60, descricao: "Atendimento completo com nossa equipe." },
  { id: "retorno", nome: "Retorno", duracaoMin: 20, descricao: "Acompanhamento de um atendimento anterior." },
];

export type DiaDisponivel = {
  data: string; // yyyy-mm-dd
  horarios: string[];
};

export const DIAS_DISPONIVEIS: DiaDisponivel[] = [
  { data: "2024-07-15", horarios: ["09:00", "09:30", "10:30", "14:00", "15:00"] },
  { data: "2024-07-16", horarios: ["10:00", "11:00", "13:30", "16:00"] },
  { data: "2024-07-17", horarios: ["09:00", "09:30", "10:00", "14:30"] },
  { data: "2024-07-18", horarios: ["11:00", "13:00", "13:30", "15:30", "16:30"] },
  { data: "2024-07-19", horarios: ["09:30", "10:30", "14:00"] },
];
