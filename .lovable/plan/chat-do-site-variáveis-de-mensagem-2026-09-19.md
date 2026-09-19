# Chat do site + variáveis de mensagem

## Respostas às suas dúvidas

**Chat ao vivo ou chatbot?** O melhor para o seu caso é o meio: um chat no site que recebe a
primeira mensagem, faz as perguntas básicas (nome, e-mail/WhatsApp, o que precisa), avisa a
equipe e fica aguardando uma pessoa entrar ao vivo. Assim ninguém fica sem resposta fora do
horário e a equipe não precisa ficar olhando a tela o dia inteiro.

**O botão "Configurar canal"** hoje leva para a lista geral de Conexões, que não fala do site do
cliente. Vai passar a levar para uma tela própria do chat do site, e o chat também vai aparecer
como cartão em Conexões.

**Variáveis dos modelos:** hoje são só números (`{{1}}`, `{{2}}`), sem lugar para consultá-las.
Vai existir uma lista pronta de variáveis do CRM, escolhidas por clique, com nome claro.

## O que será feito

### 1. Nova tela: Chat do site
Em Integrações, um item "Chat do site", também acessível pelo botão "Configurar canal" da tela
ChatBot e por um cartão novo em Conexões.

A tela terá:
- Código para colar no site do cliente, com botão de copiar.
- Estado da instalação (aguardando primeira visita / recebendo mensagens).
- Aparência: posição do balão, cor (herda a cor da marca), título e texto de boas-vindas.
- Perguntas de entrada: nome, e-mail, WhatsApp e assunto — cada uma ligada/desligada e
  obrigatória ou não.
- Horário de atendimento, com mensagem diferente fora do horário.
- Aviso para a equipe: quem recebe (todos, fila, pessoas escolhidas) e por onde (aviso interno,
  e-mail, WhatsApp).
- Mensagem automática de espera ("recebemos, já chamamos alguém").

### 2. Tela ChatBot ajustada ao fluxo "recebe e avisa"
- Etiqueta clara em cada conversa: aguardando equipe, em atendimento, encerrada.
- Tempo de espera visível e ordenação pelas que esperam há mais tempo.
- Botão "Assumir" assume a conversa e a passa para "em atendimento"; "Encerrar" fecha.
- Dados coletados pelo chat (nome, e-mail, WhatsApp, página de origem) num painel ao lado.
- Campo de resposta liberado quando a conversa está assumida (nesta fase ainda como exemplo,
  sem envio real ao visitante).

### 3. Variáveis de mensagem do CRM
Uma lista única de variáveis, usada tanto em Modelos de mensagem quanto em Respostas rápidas,
agrupada por assunto:
- Contato: nome, primeiro nome, empresa, cargo, cidade, e-mail, WhatsApp.
- Negócio: título, valor, etapa, funil, responsável.
- Compromisso: título, data, hora, link.
- Empresa: nome da marca, WhatsApp de atendimento, assinatura do usuário.

Nas telas de modelos e respostas rápidas:
- Painel lateral com as variáveis; clicar insere no texto onde o cursor está.
- Prévia mostrando o texto com valores de exemplo preenchidos.
- Aviso quando o texto usa uma variável que não existe.
- Nos modelos do WhatsApp oficial, as variáveis continuam aparecendo numeradas no envio, com a
  legenda "1 = nome do contato, 2 = número do pedido" abaixo da prévia.

## Detalhes técnicos

- Nova rota `src/routes/_authenticated/integracoes.chat-site.tsx`; item em `src/lib/nav.ts`;
  cartão em `src/lib/demo/configuracoes.ts` (conexões) e link no botão de `chatbot.tsx`.
- Novo módulo `src/lib/variaveis.ts` com o catálogo de variáveis, valores de exemplo,
  substituição e detecção de variáveis inválidas; reutilizado por `modelos.tsx` e
  `respostas-rapidas.tsx`.
- Configuração do chat do site guardada em `app_settings` como novo campo JSON
  `site_chat_settings` (migração), lida/salva na tela — igual ao padrão já usado em
  lembretes e sincronização de agenda.
- Conversas do ChatBot seguem como dados de exemplo em `src/lib/demo/`, com os novos campos de
  status e espera.

## Fica para depois

O recebimento real das mensagens do site (endpoint público + widget servido ao visitante) e o
envio das respostas ao visitante entram quando o sistema for instalado no servidor do cliente,
junto com o gateway do WhatsApp.
