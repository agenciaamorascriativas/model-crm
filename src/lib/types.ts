export interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
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
  last_message_at: string;
  created_at: string;
  updated_at: string;
  contacts?: Contact | null;
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
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string | null;
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

export interface AppSettings {
  id: number;
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  favicon_url: string | null;
  whatsapp_number: string | null;
  updated_at: string;
}
