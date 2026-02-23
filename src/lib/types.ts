export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  kilojoules: number;
  protein: number;
  carbs: number;
  fiber: number;
  sugars: number;
  addedSugars: number;
  fat: number;
  saturatedFat: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutItem {
  id: string;
  name: string;
  caloriesPerUnit: number;
  unit: 'minutes' | 'reps' | 'sets';
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityItem {
  id: string;
  name: string;
  type: 'meditation' | 'screen_time';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoggedFood {
  id: string;
  inventoryId: string;
  quantity: number;
}

export interface LoggedWorkout {
  id: string;
  inventoryId: string;
  quantity: number;
}

export interface SleepSession {
  id: string;
  startTime: string;
  endTime: string;
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface CustomMetric {
  id: string;
  name: string;
  unit: string;
  target?: number;
  type: 'number' | 'boolean';
}

export interface DailyLog {
  date: string;
  foodItems: LoggedFood[];
  workoutItems: LoggedWorkout[];
  steps: number;
  sleepSessions: SleepSession[];
  waterMl: number;
  caffeineMg: number;
  workMins: number;
  screenMins: number;
  meditationMins: number;
  customMetrics: Record<string, number | boolean>;
}

export interface DailyTargets {
  calories: number;
  kilojoules: number;
  protein: number;
  carbs: number;
  fiber: number;
  sugars: number;
  fat: number;
  saturatedFat: number;
  waterMl: number;
  steps: number;
  sleepHours: number;
}

export interface UserSettings {
  id: string;
  dailyTargets: DailyTargets;
  customMetrics: CustomMetric[];
}

export type FoodItemInput = Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>;
export type WorkoutItemInput = Omit<WorkoutItem, 'id' | 'createdAt' | 'updatedAt'>;
export type ActivityItemInput = Omit<ActivityItem, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomMetricInput = Omit<CustomMetric, 'id'>;
