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
  protein: 150,
  carbs: 250,
  fat: 65,
  waterMl: 2500,
  steps: 10000,
  sleepHours: 8,
};

export const DEFAULT_CUSTOM_METRICS = [
  { id: 'sugar', name: 'Sugar', unit: 'g', target: 25, type: 'number' as const },
  { id: 'salt', name: 'Salt', unit: 'mg', target: 2300, type: 'number' as const },
  { id: 'fiber', name: 'Fiber', unit: 'g', target: 25, type: 'number' as const },
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
