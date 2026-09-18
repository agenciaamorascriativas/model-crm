ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS primary_color text NOT NULL DEFAULT '#A52C64',
  ADD COLUMN IF NOT EXISTS favicon_url text;

GRANT SELECT ON public.app_settings TO anon;
CREATE POLICY "Marca visivel no acesso"
ON public.app_settings
FOR SELECT
TO anon
USING (id = 1);

CREATE POLICY "Marca visivel para visitantes"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'brand-assets');

CREATE POLICY "Equipe visualiza arquivos da marca"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'brand-assets');

CREATE POLICY "Admins enviam arquivos da marca"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam arquivos da marca"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins removem arquivos da marca"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'));