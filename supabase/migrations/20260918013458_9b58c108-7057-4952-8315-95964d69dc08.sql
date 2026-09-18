CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

ALTER POLICY "Admin edita configuracoes"
ON public.app_settings
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

ALTER POLICY "Admins enviam arquivos da marca"
ON storage.objects
WITH CHECK (bucket_id = 'brand-assets' AND private.has_role(auth.uid(), 'admin'));

ALTER POLICY "Admins atualizam arquivos da marca"
ON storage.objects
USING (bucket_id = 'brand-assets' AND private.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'brand-assets' AND private.has_role(auth.uid(), 'admin'));

ALTER POLICY "Admins removem arquivos da marca"
ON storage.objects
USING (bucket_id = 'brand-assets' AND private.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;