import Dexie, { type EntityTable } from 'dexie';
import type { FoodItem, WorkoutItem, ActivityItem, DailyLog, UserSettings } from './types';

const db = new Dexie('HealthToGoDB') as Dexie & {
  foodInventory: EntityTable<FoodItem, 'id'>;
  workoutInventory: EntityTable<WorkoutItem, 'id'>;
  activityInventory: EntityTable<ActivityItem, 'id'>;
  dailyLogs: EntityTable<DailyLog, 'date'>;
  userSettings: EntityTable<UserSettings, 'id'>;
};

db.version(1).stores({
  foodInventory: 'id, name, createdAt',
  workoutInventory: 'id, name, createdAt',
  activityInventory: 'id, name, type, createdAt',
  dailyLogs: 'date',
  userSettings: 'id',
});

db.version(2).upgrade(() => {
  return Promise.resolve();
});

export { db };

export const DEFAULT_TARGETS = {
  calories: 2000,
  kilojoules: 8400,
  protein: 150,
  carbs: 250,
  fiber: 30,
  sugars: 30,
  fat: 65,
  saturatedFat: 20,
  waterMl: 2500,
  steps: 10000,
  sleepHours: 8,
};

export const DEFAULT_CUSTOM_METRICS = [
  { id: 'caffeine', name: 'Caffeine', unit: 'mg', target: 400, type: 'number' as const },
  { id: 'salt', name: 'Salt', unit: 'mg', target: 2300, type: 'number' as const },
  { id: 'cholesterol', name: 'Cholesterol', unit: 'mg', target: 300, type: 'number' as const },
  { id: 'sodium', name: 'Sodium', unit: 'mg', target: 2300, type: 'number' as const },
  { id: 'potassium', name: 'Potassium', unit: 'mg', target: 3500, type: 'number' as const },
];

export async function initializeSettings() {
  const existingSettings = await db.userSettings.get('default');
  if (!existingSettings) {
    await db.userSettings.add({
      id: 'default',
      dailyTargets: DEFAULT_TARGETS,
      customMetrics: DEFAULT_CUSTOM_METRICS,
    });
  }
}
