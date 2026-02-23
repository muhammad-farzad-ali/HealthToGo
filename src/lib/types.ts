export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  steps: number;
}

export interface UserSettings {
  id: string;
  dailyTargets: DailyTargets;
}

export type FoodItemInput = Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>;
export type WorkoutItemInput = Omit<WorkoutItem, 'id' | 'createdAt' | 'updatedAt'>;
export type ActivityItemInput = Omit<ActivityItem, 'id' | 'createdAt' | 'updatedAt'>;
