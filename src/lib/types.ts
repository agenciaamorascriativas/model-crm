export interface AiProviderCredential {
  provider: "openai" | "anthropic" | "google";
  key_hint: string;
  active: boolean;
  models: Record<string, string>;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  job_title: string | null;
  category: string | null;
  source: string | null;
  cpf: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  linkedin: string | null;
  instagram: string | null;
  notes: string | null;
  tags: string[];
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  contact_id: string;
  status: "aberta" | "fechada";
  assignee: string | null;
  snoozed_until: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  contacts?: Contact | null;
}

export interface Demanda {
  id: string;
  contact_id: string;
  title: string;
  status: "aberta" | "resolvida" | "cancelada";
  resolution: string | null;
  owner_id: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: "entrada" | "saida";
  body: string | null;
  media_url: string | null;
  author_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  job_title: string | null;
  phone: string | null;
  language: string | null;
  timezone: string | null;
  signature: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  is_default: boolean;
  archived: boolean;
  position: number;
  created_at: string;
}

export type StageRole = "nenhum" | "fechamento" | "perda";

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string | null;
  stage_role: StageRole;
  assistant_key: string | null;
  archived: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  title: string;
  contact_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  value_cents: number;
  status: "aberto" | "ganho" | "perdido";
  position: number;
  owner_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contacts?: Contact | null;
}

export interface LeadEvent {
  id: string;
  lead_id: string;
  kind: "nota" | "movimento" | "sistema";
  content: string | null;
  author_id: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  title: string;
  contact_id: string | null;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  contacts?: { name: string } | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assignee: string | null;
  done: boolean;
  contact_id: string | null;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarSyncState {
  status: "nao_configurado" | "conectado";
  email?: string | null;
  connected_at?: string | null;
}

export interface CalendarSync {
  google: CalendarSyncState;
  outlook: CalendarSyncState;
}

export interface ReminderSettings {
  enabled: boolean;
  offsets: string[];
  channels: string[];
  recipients: string[];
  template: string;
}

export interface AntibanSettings {
  enabled: boolean;
  max_per_minute: number;
  jitter_min_seconds: number;
  jitter_max_seconds: number;
  window_start: string;
  window_end: string;
}

export interface SiteChatField {
  enabled: boolean;
  required: boolean;
}

export interface SiteChatSettings {
  enabled: boolean;
  position: "direita" | "esquerda";
  title: string;
  welcome: string;
  waiting_message: string;
  offhours_message: string;
  fields: {
    name: SiteChatField;
    email: SiteChatField;
    phone: SiteChatField;
    subject: SiteChatField;
  };
  hours: { start: string; end: string; days: string[] };
  notify: { target: "todos" | "fila" | "pessoas"; people: string[]; channels: string[] };
}

export interface AppSettings {
  id: number;
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  favicon_url: string | null;
  whatsapp_number: string | null;
  calendar_sync: CalendarSync;
  reminder_settings: ReminderSettings;
  antiban_settings: AntibanSettings;
  updated_at: string;
}
