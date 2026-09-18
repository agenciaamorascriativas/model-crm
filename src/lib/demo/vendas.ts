// Dados de exemplo do bloco de Vendas (contatos, negócios, funis, produtos e atividades).
// Somente para fins visuais — não representam dados reais.

export type EtapaFunil = {
  id: string;
  nome: string;
  cor: string;
  probabilidade: number;
  ordem: number;
};

export type Funil = {
  id: string;
  nome: string;
  padrao: boolean;
  etapas: EtapaFunil[];
};

export const FUNIS: Funil[] = [
  {
    id: "funil-comercial",
    nome: "Funil Comercial",
    padrao: true,
    etapas: [
      { id: "etapa-novo", nome: "Novo contato", cor: "#64748b", probabilidade: 10, ordem: 1 },
      { id: "etapa-qualificacao", nome: "Qualificação", cor: "#0ea5e9", probabilidade: 25, ordem: 2 },
      { id: "etapa-proposta", nome: "Proposta enviada", cor: "#f59e0b", probabilidade: 50, ordem: 3 },
      { id: "etapa-negociacao", nome: "Negociação", cor: "#8b5cf6", probabilidade: 70, ordem: 4 },
      { id: "etapa-fechamento", nome: "Fechamento", cor: "#22c55e", probabilidade: 90, ordem: 5 },
    ],
  },
  {
    id: "funil-renovacao",
    nome: "Funil de Renovação",
    padrao: false,
    etapas: [
      { id: "etapa-ren-contato", nome: "Contato de renovação", cor: "#64748b", probabilidade: 20, ordem: 1 },
      { id: "etapa-ren-proposta", nome: "Nova proposta", cor: "#f59e0b", probabilidade: 55, ordem: 2 },
      { id: "etapa-ren-fechamento", nome: "Renovado", cor: "#22c55e", probabilidade: 90, ordem: 3 },
    ],
  },
  {
    id: "funil-parceiros",
    nome: "Funil de Parceiros",
    padrao: false,
    etapas: [
      { id: "etapa-par-indicacao", nome: "Indicação recebida", cor: "#0ea5e9", probabilidade: 15, ordem: 1 },
      { id: "etapa-par-reuniao", nome: "Reunião agendada", cor: "#8b5cf6", probabilidade: 40, ordem: 2 },
      { id: "etapa-par-acordo", nome: "Acordo fechado", cor: "#22c55e", probabilidade: 85, ordem: 3 },
    ],
  },
];

export type Contato = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  empresa: string;
  cargo?: string;
  etiquetas: string[];
  responsavel: string;
  camposPersonalizados: { rotulo: string; valor: string }[];
};

export const CONTATOS: Contato[] = [
  {
    id: "c1",
    nome: "Mariana Alves",
    telefone: "(11) 98221-3345",
    email: "mariana.alves@florescer.com.br",
    empresa: "Florescer Cosméticos",
    cargo: "Compradora",
    etiquetas: ["Cliente VIP", "Atacado"],
    responsavel: "Camila Souza",
    camposPersonalizados: [
      { rotulo: "Origem", valor: "Indicação" },
      { rotulo: "Cidade", valor: "São Paulo - SP" },
      { rotulo: "Ticket médio", valor: "R$ 2.400,00" },
    ],
  },
  {
    id: "c2",
    nome: "Rodrigo Fontes",
    telefone: "(21) 99110-2278",
    email: "rodrigo.fontes@gmail.com",
    empresa: "Fontes Distribuidora",
    cargo: "Sócio-diretor",
    etiquetas: ["Novo lead"],
    responsavel: "Bruno Lima",
    camposPersonalizados: [
      { rotulo: "Origem", valor: "Instagram" },
      { rotulo: "Cidade", valor: "Rio de Janeiro - RJ" },
    ],
  },
  {
    id: "c3",
    nome: "Juliana Prado",
    telefone: "(31) 98877-6654",
    email: "ju.prado@outlook.com",
    empresa: "Prado Estética",
    cargo: "Proprietária",
    etiquetas: ["Recorrente"],
    responsavel: "Camila Souza",
    camposPersonalizados: [
      { rotulo: "Origem", valor: "WhatsApp" },
      { rotulo: "Cidade", valor: "Belo Horizonte - MG" },
      { rotulo: "Aniversário", valor: "14/03" },
    ],
  },
  {
    id: "c4",
    nome: "Eduardo Nogueira",
    telefone: "(41) 99654-1122",
    email: "eduardo@nogueiramoda.com",
    empresa: "Nogueira Moda Íntima",
    cargo: "Gerente comercial",
    etiquetas: ["Atacado", "Inadimplente"],
    responsavel: "Bruno Lima",
    camposPersonalizados: [
      { rotulo: "Origem", valor: "Feira de negócios" },
      { rotulo: "Cidade", valor: "Curitiba - PR" },
    ],
  },
  {
    id: "c5",
    nome: "Patrícia Menezes",
    telefone: "(85) 98765-4321",
    email: "patricia.menezes@bellazza.com",
    empresa: "Bellazza Perfumaria",
    cargo: "Compradora sênior",
    etiquetas: ["Cliente VIP"],
    responsavel: "Camila Souza",
    camposPersonalizados: [
      { rotulo: "Origem", valor: "Site" },
      { rotulo: "Cidade", valor: "Fortaleza - CE" },
    ],
  },
];

export type EventoLinhaDoTempo = {
  id: string;
  tipo: "mensagem_enviada" | "mensagem_recebida" | "ligacao" | "nota" | "estagio" | "reuniao" | "tarefa";
  titulo: string;
  descricao?: string;
  autor: string;
  data: string; // ISO
};

export const LINHA_DO_TEMPO: Record<string, EventoLinhaDoTempo[]> = {
  c1: [
    { id: "e1", tipo: "mensagem_recebida", titulo: "Mensagem recebida no WhatsApp", descricao: "Vocês têm o kit hidratante em promoção esse mês?", autor: "Mariana Alves", data: "2024-05-02T09:12:00" },
    { id: "e2", tipo: "mensagem_enviada", titulo: "Resposta enviada", descricao: "Sim! Temos 15% de desconto para pedidos acima de 20 unidades.", autor: "Camila Souza", data: "2024-05-02T09:20:00" },
    { id: "e3", tipo: "estagio", titulo: "Negócio movido para Proposta enviada", autor: "Camila Souza", data: "2024-05-03T14:00:00" },
    { id: "e4", tipo: "ligacao", titulo: "Ligação realizada (8 min)", descricao: "Alinhamento de quantidades e prazo de entrega.", autor: "Camila Souza", data: "2024-05-05T11:30:00" },
    { id: "e5", tipo: "nota", titulo: "Nota adicionada", descricao: "Cliente prefere pagamento via boleto 28 dias.", autor: "Camila Souza", data: "2024-05-06T16:45:00" },
  ],
  c2: [
    { id: "e6", tipo: "mensagem_recebida", titulo: "Mensagem recebida no Instagram", descricao: "Gostaria de um catálogo de produtos para revenda.", autor: "Rodrigo Fontes", data: "2024-05-10T10:05:00" },
    { id: "e7", tipo: "estagio", titulo: "Negócio movido para Qualificação", autor: "Bruno Lima", data: "2024-05-10T10:30:00" },
  ],
  c3: [
    { id: "e8", tipo: "reuniao", titulo: "Reunião de apresentação agendada", autor: "Camila Souza", data: "2024-04-20T15:00:00" },
    { id: "e9", tipo: "estagio", titulo: "Negócio movido para Negociação", autor: "Camila Souza", data: "2024-04-25T09:00:00" },
    { id: "e10", tipo: "tarefa", titulo: "Tarefa concluída: Enviar contrato", autor: "Camila Souza", data: "2024-04-28T13:20:00" },
  ],
  c4: [
    { id: "e11", tipo: "ligacao", titulo: "Ligação sem retorno", autor: "Bruno Lima", data: "2024-03-15T11:00:00" },
    { id: "e12", tipo: "nota", titulo: "Nota adicionada", descricao: "Cliente com fatura em aberto há 45 dias.", autor: "Bruno Lima", data: "2024-03-16T09:00:00" },
  ],
  c5: [
    { id: "e13", tipo: "mensagem_enviada", titulo: "Mensagem enviada", descricao: "Segue proposta comercial em anexo.", autor: "Camila Souza", data: "2024-05-01T08:40:00" },
    { id: "e14", tipo: "estagio", titulo: "Negócio movido para Fechamento", autor: "Camila Souza", data: "2024-05-08T17:10:00" },
  ],
};

export type TipoItem = "produto" | "servico";

export type Produto = {
  id: string;
  nome: string;
  codigo: string;
  tipo: TipoItem;
  categoria: string;
  precoCents: number;
  recorrencia: "unico" | "mensal" | "anual";
  ativo: boolean;
};

export const PRODUTOS: Produto[] = [
  { id: "p1", nome: "Kit Hidratante Corporal 500ml", codigo: "COS-1001", tipo: "produto", categoria: "Cosméticos", precoCents: 8990, recorrencia: "unico", ativo: true },
  { id: "p2", nome: "Perfume Bellazza Intense 100ml", codigo: "PER-2044", tipo: "produto", categoria: "Perfumaria", precoCents: 15900, recorrencia: "unico", ativo: true },
  { id: "p3", nome: "Assinatura Beleza Mensal", codigo: "ASS-3010", tipo: "servico", categoria: "Assinaturas", precoCents: 6900, recorrencia: "mensal", ativo: true },
  { id: "p4", nome: "Consultoria de Revenda", codigo: "SRV-4020", tipo: "servico", categoria: "Serviços", precoCents: 45000, recorrencia: "unico", ativo: false },
  { id: "p5", nome: "Kit Atacado Sabonetes Artesanais", codigo: "COS-1050", tipo: "produto", categoria: "Cosméticos", precoCents: 32000, recorrencia: "unico", ativo: true },
  { id: "p6", nome: "Plano Distribuidor Anual", codigo: "ASS-3099", tipo: "servico", categoria: "Assinaturas", precoCents: 480000, recorrencia: "anual", ativo: true },
  { id: "p7", nome: "Sérum Facial Vitamina C 30ml", codigo: "COS-1077", tipo: "produto", categoria: "Cosméticos", precoCents: 12900, recorrencia: "unico", ativo: true },
  { id: "p8", nome: "Suporte Prioritário", codigo: "SRV-4033", tipo: "servico", categoria: "Serviços", precoCents: 9900, recorrencia: "mensal", ativo: false },
];

export type ItemNegocio = {
  produtoId: string;
  quantidade: number;
  precoCents: number;
};

export type Tarefa = {
  id: string;
  titulo: string;
  responsavel: string;
  data: string;
  concluida: boolean;
};

export type Arquivo = {
  id: string;
  nome: string;
  tamanho: string;
  enviadoPor: string;
  data: string;
};

export type Nota = {
  id: string;
  conteudo: string;
  autor: string;
  data: string;
};

export type Negocio = {
  id: string;
  titulo: string;
  contatoId: string;
  funilId: string;
  etapaId: string;
  valorCents: number;
  probabilidade: number;
  previsaoFechamento: string;
  responsavel: string;
  status: "aberto" | "ganho" | "perdido";
  motivoPerda?: string;
  itens: ItemNegocio[];
  tarefas: Tarefa[];
};

export const NEGOCIOS: Negocio[] = [
  {
    id: "n1",
    titulo: "Reposição mensal — Florescer Cosméticos",
    contatoId: "c1",
    funilId: "funil-comercial",
    etapaId: "etapa-proposta",
    valorCents: 348000,
    probabilidade: 50,
    previsaoFechamento: "2024-06-10",
    responsavel: "Camila Souza",
    status: "aberto",
    itens: [
      { produtoId: "p1", quantidade: 20, precoCents: 8990 },
      { produtoId: "p7", quantidade: 10, precoCents: 12900 },
    ],
    tarefas: [
      { id: "t1", titulo: "Enviar proposta atualizada", responsavel: "Camila Souza", data: "2024-05-08", concluida: true },
      { id: "t2", titulo: "Confirmar prazo de entrega", responsavel: "Camila Souza", data: "2024-05-14", concluida: false },
    ],
  },
  {
    id: "n2",
    titulo: "Novo pedido de revenda — Fontes Distribuidora",
    contatoId: "c2",
    funilId: "funil-comercial",
    etapaId: "etapa-qualificacao",
    valorCents: 960000,
    probabilidade: 25,
    previsaoFechamento: "2024-07-01",
    responsavel: "Bruno Lima",
    status: "aberto",
    itens: [{ produtoId: "p5", quantidade: 30, precoCents: 32000 }],
    tarefas: [{ id: "t3", titulo: "Enviar catálogo de produtos", responsavel: "Bruno Lima", data: "2024-05-12", concluida: false }],
  },
  {
    id: "n3",
    titulo: "Assinatura anual — Prado Estética",
    contatoId: "c3",
    funilId: "funil-comercial",
    etapaId: "etapa-negociacao",
    valorCents: 480000,
    probabilidade: 70,
    previsaoFechamento: "2024-05-30",
    responsavel: "Camila Souza",
    status: "aberto",
    itens: [{ produtoId: "p6", quantidade: 1, precoCents: 480000 }],
    tarefas: [{ id: "t4", titulo: "Enviar contrato para assinatura", responsavel: "Camila Souza", data: "2024-04-28", concluida: true }],
  },
  {
    id: "n4",
    titulo: "Renegociação de fatura — Nogueira Moda Íntima",
    contatoId: "c4",
    funilId: "funil-comercial",
    etapaId: "etapa-novo",
    valorCents: 210000,
    probabilidade: 10,
    previsaoFechamento: "2024-06-20",
    responsavel: "Bruno Lima",
    status: "perdido",
    motivoPerda: "Cliente optou por concorrente com prazo maior de pagamento.",
    itens: [{ produtoId: "p2", quantidade: 12, precoCents: 15900 }],
    tarefas: [{ id: "t5", titulo: "Registrar motivo da perda", responsavel: "Bruno Lima", data: "2024-03-20", concluida: true }],
  },
  {
    id: "n5",
    titulo: "Fechamento de proposta — Bellazza Perfumaria",
    contatoId: "c5",
    funilId: "funil-comercial",
    etapaId: "etapa-fechamento",
    valorCents: 219000,
    probabilidade: 90,
    previsaoFechamento: "2024-05-15",
    responsavel: "Camila Souza",
    status: "ganho",
    itens: [{ produtoId: "p2", quantidade: 10, precoCents: 15900 }, { produtoId: "p3", quantidade: 1, precoCents: 6900 }],
    tarefas: [{ id: "t6", titulo: "Enviar boas-vindas ao cliente", responsavel: "Camila Souza", data: "2024-05-09", concluida: true }],
  },
];

export const ARQUIVOS: Record<string, Arquivo[]> = {
  c1: [
    { id: "a1", nome: "Proposta_Florescer_Maio.pdf", tamanho: "482 KB", enviadoPor: "Camila Souza", data: "2024-05-03" },
    { id: "a2", nome: "Catalogo_Kit_Hidratante.pdf", tamanho: "1.2 MB", enviadoPor: "Camila Souza", data: "2024-05-02" },
  ],
  c3: [{ id: "a3", nome: "Contrato_Assinatura_Anual.pdf", tamanho: "310 KB", enviadoPor: "Camila Souza", data: "2024-04-27" }],
};

export const NOTAS: Record<string, Nota[]> = {
  c1: [{ id: "no1", conteudo: "Cliente prefere pagamento via boleto 28 dias.", autor: "Camila Souza", data: "2024-05-06T16:45:00" }],
  c4: [{ id: "no2", conteudo: "Cliente com fatura em aberto há 45 dias.", autor: "Bruno Lima", data: "2024-03-16T09:00:00" }],
};

export type Atividade = {
  id: string;
  tipo: "mensagem_enviada" | "mensagem_recebida" | "ligacao" | "reuniao" | "nota" | "negocio_movido" | "tarefa_concluida";
  titulo: string;
  descricao?: string;
  responsavel: string;
  contatoId?: string;
  data: string; // ISO
};

export const ATIVIDADES: Atividade[] = [
  { id: "at1", tipo: "mensagem_recebida", titulo: "Mensagem recebida de Mariana Alves", descricao: "Vocês têm o kit hidratante em promoção esse mês?", responsavel: "Camila Souza", contatoId: "c1", data: "2024-05-02T09:12:00" },
  { id: "at2", tipo: "mensagem_enviada", titulo: "Resposta enviada para Mariana Alves", responsavel: "Camila Souza", contatoId: "c1", data: "2024-05-02T09:20:00" },
  { id: "at3", tipo: "negocio_movido", titulo: "Negócio movido para Proposta enviada", descricao: "Reposição mensal — Florescer Cosméticos", responsavel: "Camila Souza", contatoId: "c1", data: "2024-05-03T14:00:00" },
  { id: "at4", tipo: "ligacao", titulo: "Ligação com Mariana Alves (8 min)", responsavel: "Camila Souza", contatoId: "c1", data: "2024-05-05T11:30:00" },
  { id: "at5", tipo: "nota", titulo: "Nota adicionada no contato de Mariana Alves", responsavel: "Camila Souza", contatoId: "c1", data: "2024-05-06T16:45:00" },
  { id: "at6", tipo: "mensagem_recebida", titulo: "Mensagem recebida de Rodrigo Fontes", descricao: "Gostaria de um catálogo de produtos para revenda.", responsavel: "Bruno Lima", contatoId: "c2", data: "2024-05-10T10:05:00" },
  { id: "at7", tipo: "negocio_movido", titulo: "Negócio movido para Qualificação", descricao: "Novo pedido de revenda — Fontes Distribuidora", responsavel: "Bruno Lima", contatoId: "c2", data: "2024-05-10T10:30:00" },
  { id: "at8", tipo: "reuniao", titulo: "Reunião com Juliana Prado agendada", responsavel: "Camila Souza", contatoId: "c3", data: "2024-04-20T15:00:00" },
  { id: "at9", tipo: "negocio_movido", titulo: "Negócio movido para Negociação", descricao: "Assinatura anual — Prado Estética", responsavel: "Camila Souza", contatoId: "c3", data: "2024-04-25T09:00:00" },
  { id: "at10", tipo: "tarefa_concluida", titulo: "Tarefa concluída: Enviar contrato", responsavel: "Camila Souza", contatoId: "c3", data: "2024-04-28T13:20:00" },
  { id: "at11", tipo: "ligacao", titulo: "Ligação sem retorno com Eduardo Nogueira", responsavel: "Bruno Lima", contatoId: "c4", data: "2024-03-15T11:00:00" },
  { id: "at12", tipo: "nota", titulo: "Nota adicionada no contato de Eduardo Nogueira", responsavel: "Bruno Lima", contatoId: "c4", data: "2024-03-16T09:00:00" },
  { id: "at13", tipo: "mensagem_enviada", titulo: "Proposta enviada para Patrícia Menezes", responsavel: "Camila Souza", contatoId: "c5", data: "2024-05-01T08:40:00" },
  { id: "at14", tipo: "negocio_movido", titulo: "Negócio movido para Fechamento", descricao: "Fechamento de proposta — Bellazza Perfumaria", responsavel: "Camila Souza", contatoId: "c5", data: "2024-05-08T17:10:00" },
  { id: "at15", tipo: "tarefa_concluida", titulo: "Tarefa concluída: Enviar boas-vindas ao cliente", responsavel: "Camila Souza", contatoId: "c5", data: "2024-05-09T10:00:00" },
];

export const RESPONSAVEIS = ["Camila Souza", "Bruno Lima"];

export function getContato(id: string) {
  return CONTATOS.find((c) => c.id === id);
}

export function getNegocio(id: string) {
  return NEGOCIOS.find((n) => n.id === id);
}

export function getFunil(id: string) {
  return FUNIS.find((f) => f.id === id);
}

export function getProduto(id: string) {
  return PRODUTOS.find((p) => p.id === id);
}
