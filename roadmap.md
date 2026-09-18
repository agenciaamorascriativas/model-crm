# Roadmap — CRM modelo (todas as telas e recursos)

Fora de escopo permanente: menções a Deskcomm, ao autor (Rafael), configuração da Hostgator, conexão Nuvemshop, painel de administração da plataforma (multi-empresa/cobrança).

## Fase 1 — Visual de todas as telas (dados de exemplo)
- [x] Menu lateral completo por grupos (Início, Atendimento, Vendas, Agenda, IA, Relatórios, Administração)
- [ ] Atendimento: fila, respostas rápidas, modelos de mensagem, canal oficial
- [ ] Vendas: ficha do contato, ficha do negócio, funis e estágios, produtos, atividades
- [ ] IA: visão geral, agentes, habilidades, roteamento, conhecimento, memória, casos, propostas, follow-up, execuções, conversas, provedores, consumo, evolução
- [ ] Relatórios: painel, métricas, análise, radar, auditoria, privacidade (LGPD)
- [ ] Configurações (área com subpáginas) + equipe/convite
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
