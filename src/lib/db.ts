import Dexie, { type EntityTable } from 'dexie';
import type { FoodItem, WorkoutItem, ActivityItem, DailyLog, UserSettings, Profile } from './types';

const db = new Dexie('HealthToGoDB') as Dexie & {
  foodInventory: EntityTable<FoodItem, 'id'>;
  workoutInventory: EntityTable<WorkoutItem, 'id'>;
  activityInventory: EntityTable<ActivityItem, 'id'>;
  dailyLogs: EntityTable<DailyLog, 'id'>;
  userSettings: EntityTable<UserSettings, 'id'>;
  profiles: EntityTable<Profile, 'id'>;
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

db.version(3).stores({
  foodInventory: 'id, name, createdAt',
  workoutInventory: 'id, name, createdAt',
  activityInventory: 'id, name, type, createdAt',
  dailyLogs: 'id, date, profileId',
  userSettings: 'id, profileId',
  profiles: 'id, name, isActive',
}).upgrade(async (tx) => {
  const existingProfiles = await tx.table('profiles').toArray();
  if (existingProfiles.length === 0) {
    const defaultProfileId = 'default';
    await tx.table('profiles').add({
      id: defaultProfileId,
      name: 'Default',
      createdAt: new Date(),
      isActive: true,
    });
    
    const existingLogs = await tx.table('dailyLogs').toArray();
    for (const log of existingLogs) {
      await tx.table('dailyLogs').update(log.id || log.date, {
        id: log.date,
        profileId: defaultProfileId,
      });
    }
    
    const existingSettings = await tx.table('userSettings').toArray();
    for (const settings of existingSettings) {
      await tx.table('userSettings').update(settings.id, {
        profileId: defaultProfileId,
      });
    }
  }
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

export async function initializeSettings(profileId: string) {
  const existingSettings = await db.userSettings.get(profileId);
  if (!existingSettings) {
    await db.userSettings.add({
      id: profileId,
      profileId,
      dailyTargets: DEFAULT_TARGETS,
      customMetrics: DEFAULT_CUSTOM_METRICS,
    });
  }
}

export async function seedSampleData() {
  const foodCount = await db.foodInventory.count();
  if (foodCount > 0) return;

  const sampleFoods: FoodItem[] = [
    { id: 'food-1', name: 'Chicken Breast (100g)', calories: 165, kilojoules: 690, protein: 31, carbs: 0, fiber: 0, sugars: 0, addedSugars: 0, fat: 3.6, saturatedFat: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-2', name: 'Brown Rice (1 cup)', calories: 216, kilojoules: 904, protein: 5, carbs: 45, fiber: 3.5, sugars: 0.7, addedSugars: 0, fat: 1.8, saturatedFat: 0.4, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-3', name: 'Broccoli (1 cup)', calories: 55, kilojoules: 230, protein: 3.7, carbs: 11, fiber: 5.1, sugars: 2.2, addedSugars: 0, fat: 0.6, saturatedFat: 0.1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-4', name: 'Salmon (100g)', calories: 208, kilojoules: 870, protein: 20, carbs: 0, fiber: 0, sugars: 0, addedSugars: 0, fat: 13, saturatedFat: 3, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-5', name: 'Eggs (2 large)', calories: 156, kilojoules: 653, protein: 12.6, carbs: 1.1, fiber: 0, sugars: 1.1, addedSugars: 0, fat: 10.6, saturatedFat: 3.3, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-6', name: 'Oatmeal (1 cup)', calories: 158, kilojoules: 661, protein: 6, carbs: 27, fiber: 4, sugars: 1, addedSugars: 0, fat: 3.2, saturatedFat: 0.5, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-7', name: 'Banana (medium)', calories: 105, kilojoules: 439, protein: 1.3, carbs: 27, fiber: 3.1, sugars: 14, addedSugars: 0, fat: 0.4, saturatedFat: 0.1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-8', name: 'Greek Yogurt (1 cup)', calories: 100, kilojoules: 418, protein: 17, carbs: 6, fiber: 0, sugars: 4, addedSugars: 0, fat: 0.7, saturatedFat: 0.5, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-9', name: 'Almonds (28g)', calories: 164, kilojoules: 686, protein: 6, carbs: 6, fiber: 3.5, sugars: 1.2, addedSugars: 0, fat: 14, saturatedFat: 1.1, createdAt: new Date(), updatedAt: new Date() },
    { id: 'food-10', name: 'Apple (medium)', calories: 95, kilojoules: 397, protein: 0.5, carbs: 25, fiber: 4.4, sugars: 19, addedSugars: 0, fat: 0.3, saturatedFat: 0.1, createdAt: new Date(), updatedAt: new Date() },
  ];

  const sampleWorkouts: WorkoutItem[] = [
    { id: 'workout-1', name: 'Running', caloriesPerUnit: 10, unit: 'minutes', createdAt: new Date(), updatedAt: new Date() },
    { id: 'workout-2', name: 'Cycling', caloriesPerUnit: 8, unit: 'minutes', createdAt: new Date(), updatedAt: new Date() },
    { id: 'workout-3', name: 'Swimming', caloriesPerUnit: 9, unit: 'minutes', createdAt: new Date(), updatedAt: new Date() },
    { id: 'workout-4', name: 'Weight Training', caloriesPerUnit: 6, unit: 'minutes', createdAt: new Date(), updatedAt: new Date() },
    { id: 'workout-5', name: 'Yoga', caloriesPerUnit: 3, unit: 'minutes', createdAt: new Date(), updatedAt: new Date() },
    { id: 'workout-6', name: 'HIIT', caloriesPerUnit: 12, unit: 'minutes', createdAt: new Date(), updatedAt: new Date() },
    { id: 'workout-7', name: 'Walking', caloriesPerUnit: 4, unit: 'minutes', createdAt: new Date(), updatedAt: new Date() },
    { id: 'workout-8', name: 'Push-ups', caloriesPerUnit: 0.3, unit: 'reps', createdAt: new Date(), updatedAt: new Date() },
  ];

  await db.foodInventory.bulkAdd(sampleFoods);
  await db.workoutInventory.bulkAdd(sampleWorkouts);
}
