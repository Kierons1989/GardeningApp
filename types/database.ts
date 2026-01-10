// types/database.ts

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface PlantType {
  id: string;
  top_level: string;
  middle_level: string;
  growth_habit: string[];
  ai_care_profile: AICareProfile | null;
  created_at: string;
  updated_at: string;
}

export interface Plant {
  id: string;
  user_id: string;
  name: string;
  common_name: string | null;
  species: string | null;
  plant_type: string | null; // Deprecated: use plant_type_id
  plant_type_id: string | null;
  plant_types?: PlantType | null; // Joined relation
  cultivar_name: string | null;
  area: string | null;
  planted_in: 'ground' | 'pot' | 'raised_bed' | null;
  notes: string | null;
  photo_url: string | null;
  ai_care_profile: AICareProfile | null; // Deprecated: care profiles now in plant_types table
  created_at: string;
  updated_at: string;
}

export interface AICareProfile {
  generated_at: string;
  common_name: string;
  species: string | null;
  plant_type: string;
  summary: string;
  uk_hardiness: string;
  tasks: AITask[];
  tips: string[];
}

export interface AITask {
  key: string;
  title: string;
  category: TaskCategory;
  month_start: number;
  month_end: number;
  recurrence_type: RecurrenceType;
  effort_level: EffortLevel;
  why_this_matters: string;
  how_to: string;
}

export type TaskCategory =
  | 'pruning'
  | 'feeding'
  | 'pest_control'
  | 'planting'
  | 'watering'
  | 'harvesting'
  | 'winter_care'
  | 'general';

export type RecurrenceType =
  | 'once_per_window'
  | 'weekly_in_window'
  | 'monthly_in_window';

export type EffortLevel = 'low' | 'medium' | 'high';

export interface TaskHistory {
  id: string;
  user_id: string;
  plant_id: string | null;
  task_key: string;
  action: 'done' | 'skipped' | 'snoozed';
  snooze_until: string | null;
  notes: string | null;
  created_at: string;
}

export interface TaskSuggestion {
  task: AITask;
  plant: Plant;
  source: 'ai_profile';
  due_bucket: 'this_week' | 'next_two_weeks' | 'later';
  last_action: TaskHistory | null;
}

export interface PlantContext {
  area?: string | null;
  plantedIn?: string | null;
  currentMonth: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  plant: Plant;
  history: TaskHistory[];
  currentDate: string;
}

export interface CareProfileCache {
  id: string;
  plant_name: string;
  planted_in: string | null;
  climate_zone: number | null;
  cache_version: number;
  cache_key: string;
  care_profile: AICareProfile;
  middle_level: string | null;
  created_at: string;
  hits: number;
}

export interface PlantIdentification {
  top_level: string;
  middle_level: string;
  cultivar_name: string | null;
  growth_habit: string[];
  confidence: 'high' | 'medium' | 'low';
}
