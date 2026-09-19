UPDATE public.app_settings SET site_chat_settings = site_chat_settings
  || jsonb_build_object(
    'welcome', 'Olá! Deixe sua mensagem que já chamamos uma pessoa do time.',
    'waiting_message', 'Recebemos sua mensagem. Um atendente entra na conversa em instantes.',
    'offhours_message', 'Estamos fora do horário de atendimento. Deixe seu contato que respondemos no próximo dia útil.'
  )
WHERE id = 1;

ALTER TABLE public.app_settings ALTER COLUMN site_chat_settings SET DEFAULT '{
  "enabled": true,
  "position": "direita",
  "title": "Fale com a gente",
  "welcome": "Olá! Deixe sua mensagem que já chamamos uma pessoa do time.",
  "waiting_message": "Recebemos sua mensagem. Um atendente entra na conversa em instantes.",
  "offhours_message": "Estamos fora do horário de atendimento. Deixe seu contato que respondemos no próximo dia útil.",
  "fields": {
    "name": {"enabled": true, "required": true},
    "email": {"enabled": true, "required": true},
    "phone": {"enabled": true, "required": false},
    "subject": {"enabled": true, "required": false}
  },
  "hours": {"start": "08:00", "end": "18:00", "days": ["seg","ter","qua","qui","sex"]},
  "notify": {"target": "todos", "people": [], "channels": ["interno","email"]}
}'::jsonb;