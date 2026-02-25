// types/database.ts

import type { Lawn, LawnTaskHistory } from './lawn'

export interface Profile {
  id: string;
  display_name: string | null;
  location: string | null;
  climate_zone: number | null;
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

export type GrowthStage = 'seed' | 'seedling' | 'juvenile' | 'mature' | 'dormant' | 'flowering' | 'fruiting';
export type PlantEnvironment = 'indoor' | 'outdoor' | 'greenhouse' | 'cold_frame';
export type HealthStatus = 'healthy' | 'struggling' | 'diseased' | 'recovering';

export interface PlantState {
  growth_stage: GrowthStage;
  environment: PlantEnvironment;
  health_status: HealthStatus;
  health_notes?: string;
  date_planted?: string;
  last_updated: string;
}

export interface Plant {
  id: string;
  user_id: string;
  name: string;
  common_name: string | null;
  species: string | null;
  plant_type_id: string | null;
  plant_types?: PlantType | null; // Joined relation
  cultivar_name: string | null;
  area: string | null; // DEPRECATED: Use location_type, location_custom, location_protection
  location_type: LocationType | null;
  location_custom: string | null;
  location_protection: LocationProtection | null;
  planted_in: 'ground' | 'pot' | 'raised_bed' | null;
  notes: string | null;
  photo_url: string | null;
  plant_state: PlantState | null;
  ai_care_profile: AICareProfile | null;
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

export type LocationType = 'front_garden' | 'back_garden' | 'patio' | 'other';
export type LocationProtection = 'greenhouse' | 'polytunnel' | 'cold_frame';

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

export interface PlantSearchData {
  scientific_name?: string | null;
  cycle?: string | null;
  watering?: string | null;
  sunlight?: string[] | null;
  growth_habit?: string[] | null;
  uk_hardiness?: string | null;
  source_url?: string | null;
}

export interface PlantContext {
  area?: string | null;
  plantedIn?: string | null;
  currentMonth: number;
  climateZone?: number | null;
  plantState?: PlantState | null;
  searchData?: PlantSearchData | null;
}

export interface ChatMessageImage {
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: ChatMessageImage;
  images?: ChatMessageImage[];  // Support for multiple images (up to 3)
  timestamp?: string;
}

export interface ChatContext {
  plant: Plant;
  history: TaskHistory[];
  currentDate: string;
}

export interface PlantConversation {
  id: string;
  user_id: string;
  plant_id: string;
  session_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface GardenConversation {
  id: string;
  user_id: string;
  session_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface GardenChatContext {
  plants: Plant[];
  lawn: Lawn | null;
  plantHistory: TaskHistory[];
  lawnHistory: LawnTaskHistory[];
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

export interface PlantTypeGroup {
  plantType: PlantType;
  cultivars: Plant[];
}

// Verification status for AI-identified plants
export interface PlantVerification {
  status: 'database' | 'ai_identified' | 'web_verified';
  confidence: 'high' | 'medium' | 'low';
  source_url?: string;  // URL to authoritative source (e.g., RHS)
}

// Plant search result from Perenual API or AI fallback
export interface PlantSearchResult {
  id: number;                      // Perenual ID (or -1 for AI results)
  common_name: string;             // Display name e.g. "Iceberg Rose"
  scientific_name: string | null;  // Latin name e.g. "Rosa 'Iceberg'"
  image_url: string | null;        // Thumbnail image URL
  top_level: string;               // Derived category e.g. "Rose"
  middle_level: string;            // Specific type e.g. "Floribunda Rose"
  cultivar_name: string | null;    // Specific cultivar e.g. "Iceberg"
  cycle: string;                   // "Perennial", "Annual", etc.
  watering: string;                // "Average", "Frequent", "Minimum"
  sunlight: string[];              // ["Full sun", "Part shade"]
  growth_habit: string[];          // ["Climber", "Perennial"]
  uk_hardiness: string | null;       // UK hardiness rating e.g. "Hardy to -15°C (H5)"
  source: 'perenual' | 'ai' | 'ai_verified';  // Track data origin
  verification?: PlantVerification;  // Verification details for AI results
}

// Re-export lawn types for convenience
export type {
  Lawn,
  LawnCareProfile,
  LawnTask,
  LawnTaskHistory,
  LawnMowingLog,
  LawnHealthCheck,
  LawnTaskSuggestion,
  LawnSize,
  LawnPrimaryUse,
  LawnSoilType,
  LawnCondition,
  LawnCareGoal,
  LawnHealthStatus,
  LawnTaskCategory,
  LawnTaskRecurrence,
  MowingSchedule,
} from './lawn';
