// Lawn Types

export type LawnSize = 'small' | 'medium' | 'large'
export type LawnPrimaryUse = 'ornamental' | 'family' | 'heavy_traffic' | 'shade' | 'wildflower'
export type LawnSoilType = 'clay' | 'sandy' | 'loam' | 'chalky' | 'unknown'
export type LawnCondition = 'excellent' | 'good' | 'needs_work' | 'starting_fresh'
export type LawnCareGoal = 'low_maintenance' | 'pristine' | 'family_friendly' | 'wildlife'
export type LawnHealthStatus = 'healthy' | 'needs_attention' | 'struggling'

export type LawnTaskCategory =
  | 'mowing'
  | 'feeding'
  | 'aeration'
  | 'scarification'
  | 'overseeding'
  | 'moss_control'
  | 'weed_management'
  | 'watering'
  | 'edging'
  | 'winter_care'

export type LawnTaskRecurrence =
  | 'once_per_window'
  | 'weekly_in_window'
  | 'fortnightly_in_window'
  | 'monthly_in_window'

export type EffortLevel = 'low' | 'medium' | 'high'

export interface LawnTask {
  key: string
  title: string
  category: LawnTaskCategory
  month_start: number
  month_end: number
  recurrence_type: LawnTaskRecurrence
  effort_level: EffortLevel
  why_this_matters: string
  how_to: string
}

export interface MowingSchedule {
  spring_height_mm: number
  summer_height_mm: number
  autumn_height_mm: number
  spring_frequency: string
  summer_frequency: string
  autumn_frequency: string
  first_cut_guidance: string
  last_cut_guidance: string
}

export interface LawnCareProfile {
  summary: string
  grass_type_info: string
  uk_regional_notes: string
  tasks: LawnTask[]
  tips: string[]
  mowing_schedule: MowingSchedule
}

export interface Lawn {
  id: string
  user_id: string
  name: string
  size: LawnSize
  size_sqm?: number
  primary_use: LawnPrimaryUse
  grass_type: string
  soil_type: LawnSoilType
  current_condition: LawnCondition
  health_status: LawnHealthStatus
  known_issues: string[]
  care_goal: LawnCareGoal
  notes?: string
  ai_care_profile?: LawnCareProfile
  created_at: string
  updated_at: string
}

export interface LawnTaskHistory {
  id: string
  user_id: string
  lawn_id: string
  task_key: string
  action: 'done' | 'skipped' | 'snoozed'
  snooze_until?: string
  notes?: string
  created_at: string
}

export interface LawnMowingLog {
  id: string
  user_id: string
  lawn_id: string
  mowed_at: string
  height_mm?: number
  notes?: string
  created_at: string
}

export interface LawnHealthCheck {
  id: string
  user_id: string
  lawn_id: string
  health_status: LawnHealthStatus
  issues_reported: string[]
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  notes?: string
  created_at: string
}

// Form types for lawn setup
export interface LawnSetupStep1 {
  name: string
  size: LawnSize
  size_sqm?: number
  primary_use: LawnPrimaryUse
}

export interface LawnSetupStep2 {
  grass_type: string
  soil_type: LawnSoilType
  current_condition: LawnCondition
}

export interface LawnSetupStep3 {
  care_goal: LawnCareGoal
  known_issues: string[]
  notes?: string
}

export type LawnSetupFormData = LawnSetupStep1 & LawnSetupStep2 & LawnSetupStep3

// Task suggestion type for dashboard
export interface LawnTaskSuggestion {
  task: LawnTask
  lawn: Lawn
  due_bucket: 'this_week' | 'next_two_weeks' | 'later'
  last_action: LawnTaskHistory | null
}

// Constants
export const LAWN_SIZES: { value: LawnSize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: 'Up to 50m² - typical front garden' },
  { value: 'medium', label: 'Medium', description: '50-150m² - average back garden' },
  { value: 'large', label: 'Large', description: '150m²+ - large garden or multiple areas' },
]

export const LAWN_PRIMARY_USES: { value: LawnPrimaryUse; label: string; description: string }[] = [
  { value: 'family', label: 'Family Use', description: 'Kids, pets, and regular foot traffic' },
  { value: 'ornamental', label: 'Ornamental', description: 'Primarily for looks, minimal use' },
  { value: 'heavy_traffic', label: 'Heavy Traffic', description: 'Frequent use, sports, gatherings' },
  { value: 'shade', label: 'Shade Garden', description: 'Under trees or in shaded areas' },
  { value: 'wildflower', label: 'Wildflower Mix', description: 'Wildlife-friendly with flowers' },
]

export const LAWN_GRASS_TYPES: { value: string; label: string; description: string }[] = [
  { value: 'mixed', label: 'Mixed/Unknown', description: 'Standard UK lawn mix or unsure' },
  { value: 'perennial_ryegrass', label: 'Perennial Ryegrass', description: 'Hard-wearing, quick to establish' },
  { value: 'fine_fescue', label: 'Fine Fescue', description: 'Fine texture, shade tolerant' },
  { value: 'meadow_grass', label: 'Meadow Grass', description: 'Traditional UK lawn grass' },
  { value: 'bent_grass', label: 'Bent Grass', description: 'Fine, dense - bowling green quality' },
]

export const LAWN_SOIL_TYPES: { value: LawnSoilType; label: string; description: string }[] = [
  { value: 'clay', label: 'Clay', description: 'Heavy, sticky when wet, cracks when dry' },
  { value: 'sandy', label: 'Sandy', description: 'Light, drains quickly, needs more water' },
  { value: 'loam', label: 'Loam', description: 'Ideal mix - dark, crumbly, holds moisture' },
  { value: 'chalky', label: 'Chalky', description: 'Alkaline, stony, drains well' },
  { value: 'unknown', label: 'Unknown', description: 'Not sure - we\'ll provide general advice' },
]

export const LAWN_CONDITIONS: { value: LawnCondition; label: string; description: string }[] = [
  { value: 'excellent', label: 'Excellent', description: 'Thick, green, minimal issues' },
  { value: 'good', label: 'Good', description: 'Generally healthy with minor issues' },
  { value: 'needs_work', label: 'Needs Work', description: 'Noticeable problems to address' },
  { value: 'starting_fresh', label: 'Starting Fresh', description: 'New lawn or complete renovation' },
]

export const LAWN_CARE_GOALS: { value: LawnCareGoal; label: string; description: string }[] = [
  { value: 'low_maintenance', label: 'Low Maintenance', description: 'Minimal effort, good enough is fine' },
  { value: 'family_friendly', label: 'Family Friendly', description: 'Balanced - nice looking but practical' },
  { value: 'pristine', label: 'Pristine', description: 'Bowling green quality, willing to put in work' },
  { value: 'wildlife', label: 'Wildlife Friendly', description: 'Eco-focused, some wild areas OK' },
]

export const LAWN_KNOWN_ISSUES: { value: string; label: string }[] = [
  { value: 'moss', label: 'Moss' },
  { value: 'weeds', label: 'Weeds' },
  { value: 'bare_patches', label: 'Bare patches' },
  { value: 'waterlogging', label: 'Waterlogging' },
  { value: 'compaction', label: 'Compaction' },
  { value: 'shade_stress', label: 'Shade stress' },
  { value: 'drought_damage', label: 'Drought damage' },
  { value: 'thatch_buildup', label: 'Thatch buildup' },
  { value: 'disease', label: 'Disease/fungus' },
  { value: 'pests', label: 'Pests (leatherjackets, chafer grubs)' },
]
