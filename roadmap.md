# Roadmap — CRM modelo (todas as telas e recursos)

Fora de escopo permanente: menções a Deskcomm, ao autor (Rafael), configuração da Hostgator, conexão Nuvemshop, painel de administração da plataforma (multi-empresa/cobrança).

## Fase 1 — Visual de todas as telas (dados de exemplo)
- [x] Menu lateral completo por grupos (Início, Conversas, Atendimento, CRM, Agenda, IA, Relatórios, Marketing, Integrações, Administração)
- [x] ChatBot visual separado do WhatsApp, com busca, conversa e ações de atendimento
- [ ] Atendimento: fila, respostas rápidas, modelos de mensagem, canal oficial
- [ ] Vendas: ficha do contato, ficha do negócio, funis e estágios, produtos, atividades
- [ ] IA: visão geral, agentes, habilidades, roteamento, conhecimento, memória, casos, propostas, follow-up, execuções, conversas, provedores, consumo, evolução
- [ ] Relatórios: painel, métricas, análise, radar, auditoria, privacidade (LGPD)
- [x] Revisar Configurações: visão geral em cards, Marca livre, Distribuição separada, Marketing e Integrações no menu principal
- [x] Marca persistente em todo o CRM, com logo, cor e ícone; retornos em Equipe e Privacidade
- [ ] Entrada e apoio: esqueci/redefinir senha, verificação em duas etapas, primeiros passos, páginas de erro, termos e privacidade, agendamento público

## Fase 2 — Ligar ao banco
- [ ] Migrações por bloco (etiquetas, modelos, produtos, atividades, IA, follow-up, auditoria, notificações, chaves de API, webhooks, LGPD) com RLS + GRANT
- [ ] Substituir dados de exemplo por dados reais, com permissões por cargo

## Fase 3 — WhatsApp real e IA ligada
- [ ] Gateway do WhatsApp (servidor do cliente, mesmo número) via webhook
- [ ] Agentes de IA respondendo de verdade

## Fase 4 — Modelo instalável na VPS
- [ ] Dockerfile + compose + instruções, banco e login próprios do cliente

## Pendências com o usuário
- [ ] Confirmação de e-mail no cadastro: manter ou desligar
- [ ] Chaves das integrações externas (WhatsApp, Meta Ads, Google, e-mail)

## Rodada tela por tela (marca, perfil, contatos, funis, agenda)
- [x] Marca aplicada em todo o sistema (fundo, cartões, menu, botões, campos, gráficos e contraste automático)
- [x] Meu perfil real: foto, cargo, telefone, idioma, fuso, assinatura
- [x] Contatos com cargo, categoria, origem, CPF, cidade, estado, endereço, LinkedIn, Instagram
- [x] Funis em cartões (padrão, apelido, abertos, atrasados, valor) + etapas com fechamento/perda e chave do assistente
- [x] Funil com busca, seleção de funil, filtro de atrasados e aviso de dias sem movimento
- [x] Produtos e serviços em uma tela, com tipo e filtro
- [x] Agenda com Google e Outlook (contas) e lembretes/avisos configuráveis
- [ ] Envio real de e-mail/WhatsApp dos lembretes (depois do gateway)
- [ ] Autorização definitiva Google/Outlook na instalação do cliente

## Chat do site + variáveis (feito)
- Tela "Chat do site" em Integrações: código de instalação, aparência, perguntas de entrada, horário e avisos — salvos no banco (`app_settings.site_chat_settings`).
- ChatBot: status aguardando/em atendimento/encerrada, tempo de espera, assumir/encerrar, painel com dados coletados.
- Catálogo de variáveis do CRM (`src/lib/variaveis.ts`) usado em Modelos de mensagem e Respostas rápidas, com inserção por clique, prévia e conversão para numeradas no WhatsApp oficial.
- Pendente na instalação no servidor do cliente: recebimento real das mensagens do site, widget público e envio das respostas ao visitante.
