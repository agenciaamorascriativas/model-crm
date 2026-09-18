ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS instagram text;

ALTER TABLE public.pipelines
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.pipeline_stages
  ADD COLUMN IF NOT EXISTS stage_role text NOT NULL DEFAULT 'nenhum',
  ADD COLUMN IF NOT EXISTS assistant_key text,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS signature text;

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS calendar_sync jsonb NOT NULL DEFAULT '{"google":{"status":"nao_configurado"},"outlook":{"status":"nao_configurado"}}'::jsonb,
  ADD COLUMN IF NOT EXISTS reminder_settings jsonb NOT NULL DEFAULT '{"enabled":true,"offsets":["1d","1h"],"channels":["email","interno"],"recipients":["responsavel","cliente"],"template":"Ola {{nome}}, seu compromisso «{{titulo}}» esta marcado para {{quando}}."}'::jsonb;

UPDATE public.pipelines SET slug = '/' || regexp_replace(lower(name), '[^a-z0-9]+', '_', 'g') WHERE slug IS NULL;

UPDATE public.pipelines p SET is_default = true
  WHERE p.id = (SELECT id FROM public.pipelines ORDER BY position, created_at LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.pipelines WHERE is_default);

DROP POLICY IF EXISTS "Equipe ve avatares" ON storage.objects;
CREATE POLICY "Equipe ve avatares" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuario envia proprio avatar" ON storage.objects;
CREATE POLICY "Usuario envia proprio avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Usuario atualiza proprio avatar" ON storage.objects;
CREATE POLICY "Usuario atualiza proprio avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Usuario remove proprio avatar" ON storage.objects;
CREATE POLICY "Usuario remove proprio avatar" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);