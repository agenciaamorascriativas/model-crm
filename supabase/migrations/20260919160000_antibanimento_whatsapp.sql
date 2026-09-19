ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS antiban_settings jsonb NOT NULL DEFAULT '{"enabled":true,"max_per_minute":20,"jitter_min_seconds":2,"jitter_max_seconds":6,"window_start":"08:00","window_end":"20:00"}'::jsonb;
