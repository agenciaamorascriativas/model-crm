// Catálogo único de variáveis usadas em modelos de mensagem e respostas rápidas.

export type GrupoVariavel = "Contato" | "Negócio" | "Compromisso" | "Empresa";

export type Variavel = {
  chave: string;
  rotulo: string;
  grupo: GrupoVariavel;
  exemplo: string;
};

export const VARIAVEIS: Variavel[] = [
  { chave: "nome", rotulo: "Nome do contato", grupo: "Contato", exemplo: "Marina Souza" },
  { chave: "primeiro_nome", rotulo: "Primeiro nome", grupo: "Contato", exemplo: "Marina" },
  { chave: "empresa", rotulo: "Empresa", grupo: "Contato", exemplo: "Amoras Criativas" },
  { chave: "cargo", rotulo: "Cargo", grupo: "Contato", exemplo: "Gerente de marketing" },
  { chave: "cidade", rotulo: "Cidade", grupo: "Contato", exemplo: "São Paulo" },
  { chave: "email", rotulo: "E-mail", grupo: "Contato", exemplo: "marina@empresa.com.br" },
  { chave: "whatsapp", rotulo: "WhatsApp do contato", grupo: "Contato", exemplo: "+55 11 99999-5353" },

  { chave: "negocio", rotulo: "Título do negócio", grupo: "Negócio", exemplo: "Proposta site institucional" },
  { chave: "valor", rotulo: "Valor do negócio", grupo: "Negócio", exemplo: "R$ 4.800,00" },
  { chave: "etapa", rotulo: "Etapa atual", grupo: "Negócio", exemplo: "Proposta enviada" },
  { chave: "funil", rotulo: "Funil", grupo: "Negócio", exemplo: "Vendas" },
  { chave: "responsavel", rotulo: "Responsável", grupo: "Negócio", exemplo: "Camila Duarte" },

  { chave: "titulo", rotulo: "Título do compromisso", grupo: "Compromisso", exemplo: "Reunião de alinhamento" },
  { chave: "data", rotulo: "Data", grupo: "Compromisso", exemplo: "24/09/2026" },
  { chave: "hora", rotulo: "Hora", grupo: "Compromisso", exemplo: "14:30" },
  { chave: "quando", rotulo: "Data e hora", grupo: "Compromisso", exemplo: "24/09/2026 às 14:30" },
  { chave: "link", rotulo: "Link da reunião", grupo: "Compromisso", exemplo: "https://meet.exemplo.com/abc" },

  { chave: "marca", rotulo: "Nome da marca", grupo: "Empresa", exemplo: "Amoras CRM" },
  { chave: "whatsapp_empresa", rotulo: "WhatsApp de atendimento", grupo: "Empresa", exemplo: "+55 11 4000-1000" },
  { chave: "assinatura", rotulo: "Assinatura do usuário", grupo: "Empresa", exemplo: "Equipe Amoras" },
];

export const GRUPOS_VARIAVEIS: GrupoVariavel[] = ["Contato", "Negócio", "Compromisso", "Empresa"];

export function variaveisPorGrupo(): { grupo: GrupoVariavel; itens: Variavel[] }[] {
  return GRUPOS_VARIAVEIS.map((grupo) => ({
    grupo,
    itens: VARIAVEIS.filter((v) => v.grupo === grupo),
  }));
}

export function encontrarVariavel(chave: string): Variavel | undefined {
  return VARIAVEIS.find((v) => v.chave === chave);
}

const PADRAO = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Chaves usadas no texto, na ordem de aparição e sem repetição. */
export function variaveisUsadas(texto: string): string[] {
  const usadas: string[] = [];
  for (const [, chave] of texto.matchAll(PADRAO)) {
    if (chave && !usadas.includes(chave)) usadas.push(chave);
  }
  return usadas;
}

/** Variáveis escritas no texto que não existem no catálogo (ignora as numeradas). */
export function variaveisInvalidas(texto: string): string[] {
  return variaveisUsadas(texto).filter((chave) => !/^\d+$/.test(chave) && !encontrarVariavel(chave));
}

/** Substitui as variáveis por valores de exemplo para a prévia. */
export function preencherExemplo(texto: string): string {
  return texto.replace(PADRAO, (original, chave: string) => {
    const variavel = encontrarVariavel(chave);
    return variavel ? variavel.exemplo : original;
  });
}

/**
 * Converte variáveis com nome em variáveis numeradas, como exige o WhatsApp oficial.
 * Retorna o corpo numerado e a legenda de cada número.
 */
export function paraNumeradas(texto: string): { corpo: string; legenda: { numero: number; rotulo: string }[] } {
  const ordem: string[] = [];
  const corpo = texto.replace(PADRAO, (original, chave: string) => {
    if (/^\d+$/.test(chave)) return original;
    if (!encontrarVariavel(chave)) return original;
    let indice = ordem.indexOf(chave);
    if (indice === -1) {
      ordem.push(chave);
      indice = ordem.length - 1;
    }
    return `{{${indice + 1}}}`;
  });
  const legenda = ordem.map((chave, i) => ({
    numero: i + 1,
    rotulo: encontrarVariavel(chave)?.rotulo ?? chave,
  }));
  return { corpo, legenda };
}

/** Insere uma variável na posição do cursor de um campo de texto. */
export function inserirNaPosicao(texto: string, inicio: number, fim: number, chave: string): { texto: string; cursor: number } {
  const trecho = `{{${chave}}}`;
  const novo = texto.slice(0, inicio) + trecho + texto.slice(fim);
  return { texto: novo, cursor: inicio + trecho.length };
}
