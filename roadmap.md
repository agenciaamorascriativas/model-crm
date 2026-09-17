# Roadmap — Reconstrução do CRM (v1)

## Concluído
- [x] Banco de dados: perfis, cargos (admin/membro), contatos, conversas/mensagens (realtime), funil/estágios/negócios/histórico, agenda, tarefas, configurações — com RLS e GRANTs
- [x] Login por e-mail/senha + cadastro (primeiro usuário vira administrador)
- [x] Casca: menu lateral (WhatsApp, Contatos, Funil, Agenda, Tarefas, Equipe, Configurações), identidade visual "Amoras CRM"
- [x] Contatos: lista, busca, criar/editar/excluir, tags
- [x] WhatsApp: lista de conversas, chat com mensagens em tempo real, envio interno registrado
- [x] Funil: kanban com arrastar-e-soltar, valores, marcar ganho/perdido, funil padrão criado
- [x] Agenda: calendário + compromissos por dia
- [x] Tarefas: lista com prazo, responsável, concluir
- [x] Equipe: membros, cargos (admin), adicionar acesso com senha provisória
- [x] Configurações: nome do sistema, número do WhatsApp (admin), perfil próprio

## Pendente
- [ ] Varredura final de referências ao autor (regra permanente; fazer antes de publicar)
- [ ] WhatsApp real (envio/recebimento) via gateway/webhook do servidor Portainer atual — aguarda o usuário conectar o gateway
- [ ] Docker/Portainer: Dockerfile + compose no final
- [ ] Decisão do usuário: manter ou desativar confirmação de e-mail no cadastro
