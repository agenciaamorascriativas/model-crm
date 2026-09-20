ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS site_chat_settings jsonb NOT NULL DEFAULT '{
    "enabled": true,
    "position": "direita",
    "title": "Fale com a gente",
    "welcome": "Ola! Deixe sua mensagem que ja chamamos uma pessoa do time.",
    "waiting_message": "Recebemos sua mensagem. Um atendente entra na conversa em instantes.",
    "offhours_message": "Estamos fora do horario de atendimento. Deixe seu contato que respondemos no proximo dia util.",
    "fields": {
      "name": {"enabled": true, "required": true},
      "email": {"enabled": true, "required": true},
      "phone": {"enabled": true, "required": false},
      "subject": {"enabled": true, "required": false}
    },
    "hours": {"start": "08:00", "end": "18:00", "days": ["seg","ter","qua","qui","sex"]},
    "notify": {"target": "todos", "people": [], "channels": ["interno","email"]}
  }'::jsonb;