import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, subDays } from 'date-fns';
import { db, DEFAULT_TARGETS } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, Dumbbell, Droplets, Activity, Scale, Ruler, Heart, Thermometer } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
}

function ProgressRing({ value, max, label, unit, color }: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color || "currentColor"}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
            className="transition-all duration-500"
            style={{ color: color || '#3b82f6' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{Math.round(percentage)}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{Math.round(value)}/{max}{unit}</span>
    </div>
  );
}

export function Dashboard() {
  const today = formatDate(new Date());
  const dailyLog = useLiveQuery(async () => {
    const log = await db.dailyLogs.get(today);
    return log || null;
  }, [today]);

  const settings = useLiveQuery(() => db.userSettings.get('default'));
  const targets = settings?.dailyTargets || DEFAULT_TARGETS;
  const foodInventory = useLiveQuery(() => db.foodInventory.toArray());
  const workoutInventory = useLiveQuery(() => db.workoutInventory.toArray());

  const [timePeriod, setTimePeriod] = useState<string>('7');
  const [selectedMetric, setSelectedMetric] = useState<string>('calories');

  const getDatesForPeriod = (days: number) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      dates.push(formatDate(subDays(new Date(), i)));
    }
    return dates;
  };

  const metricOptions = [
    { id: 'calories', name: 'Calories In', color: '#ef4444' },
    { id: 'burned', name: 'Calories Burned', color: '#22c55e' },
    { id: 'protein', name: 'Protein', color: '#22c55e' },
    { id: 'carbs', name: 'Carbs', color: '#eab308' },
    { id: 'fat', name: 'Fat', color: '#f97316' },
    { id: 'fiber', name: 'Fiber', color: '#84cc16' },
    { id: 'sugars', name: 'Sugars', color: '#8b5cf6' },
    { id: 'saturatedFat', name: 'Sat Fat', color: '#ec4899' },
    { id: 'sleep', name: 'Sleep Hours', color: '#a855f7' },
    { id: 'steps', name: 'Steps', color: '#3b82f6' },
    { id: 'water', name: 'Water (ml)', color: '#06b6d4' },
    { id: 'mood', name: 'Mood', color: '#22c55e', wellbeing: true },
    { id: 'stress', name: 'Stress', color: '#ef4444', wellbeing: true },
    { id: 'energy', name: 'Energy', color: '#eab308', wellbeing: true },
    { id: 'heartRate', name: 'Heart Rate', color: '#ef4444', physiological: true },
    { id: 'weight', name: 'Weight', color: '#3b82f6', physiological: true },
    { id: 'waistCm', name: 'Waist (cm)', color: '#22c55e', physiological: true },
    { id: 'bodyTemp', name: 'Body Temp', color: '#f97316', physiological: true },
    { id: 'bloodSugar', name: 'Blood Sugar', color: '#8b5cf6', physiological: true },
    { id: 'bloodPressure', name: 'Blood Pressure', color: '#ef4444', physiological: true },
    { id: 'oxygenSaturation', name: 'O2 Saturation', color: '#06b6d4', physiological: true },
  ];

  const periodDays = parseInt(timePeriod);

  const periodLogs = useLiveQuery(async () => {
    const dates = getDatesForPeriod(periodDays);
    const logs = await Promise.all(
      dates.map(date => db.dailyLogs.get(date))
    );
    return logs.map((log, i) => ({
      date: format(subDays(new Date(), periodDays - 1 - i), 'MMM d'),
      fullDate: dates[i],
      log: log || null,
    }));
  }, [periodDays]);

  const calculateNutrition = (log: any) => {
    if (!log || !foodInventory) return { 
      calories: 0, kilojoules: 0, protein: 0, carbs: 0, fiber: 0, sugars: 0, fat: 0, saturatedFat: 0 
    };
    return log.foodItems.reduce(
      (acc: any, item: any) => {
        const food = foodInventory.find((f) => f.id === item.inventoryId);
        if (food) {
          const qty = item.quantity;
          acc.calories += (food.calories || 0) * qty;
          acc.kilojoules += (food.kilojoules || 0) * qty;
          acc.protein += (food.protein || 0) * qty;
          acc.carbs += (food.carbs || 0) * qty;
          acc.fiber += (food.fiber || 0) * qty;
          acc.sugars += (food.sugars || 0) * qty;
          acc.fat += (food.fat || 0) * qty;
          acc.saturatedFat += (food.saturatedFat || 0) * qty;
        }
        return acc;
      },
      { calories: 0, kilojoules: 0, protein: 0, carbs: 0, fiber: 0, sugars: 0, fat: 0, saturatedFat: 0 }
    );
  };

  const calculateCaloriesBurned = (log: any) => {
    let burned = 0;
    if (log?.workoutItems && workoutInventory) {
      burned = log.workoutItems.reduce((acc: number, item: any) => {
        const workout = workoutInventory.find((w) => w.id === item.inventoryId);
        if (workout) {
          acc += workout.caloriesPerUnit * item.quantity;
        }
        return acc;
      }, 0);
    }
    const stepsCalories = Math.round((log?.steps || 0) * 0.05);
    return burned + stepsCalories;
  };

  const getTotalSleep = (log: any) => {
    if (!log?.sleepSessions) return 0;
    return log.sleepSessions.reduce((acc: number, session: any) => {
      const [startH, startM] = session.startTime.split(':').map(Number);
      const [endH, endM] = session.endTime.split(':').map(Number);
      let duration = (endH + 24 - startH) % 24 + (endM - startM) / 60;
      return acc + duration;
    }, 0);
  };

  const nutrition = dailyLog ? calculateNutrition(dailyLog) : { 
    calories: 0, kilojoules: 0, protein: 0, carbs: 0, fiber: 0, sugars: 0, fat: 0, saturatedFat: 0 
  };
  const caloriesBurned = dailyLog ? calculateCaloriesBurned(dailyLog) : 0;
  const totalSleep = dailyLog ? getTotalSleep(dailyLog) : 0;
  const netCalories = nutrition.calories - caloriesBurned;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Today's Overview</h2>
        <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ProgressRing
          value={nutrition.calories}
          max={targets.calories}
          label="Calories"
          unit="kcal"
          color="#ef4444"
        />
        <ProgressRing
          value={nutrition.protein}
          max={targets.protein}
          label="Protein"
          unit="g"
          color="#22c55e"
        />
        <ProgressRing
          value={nutrition.carbs}
          max={targets.carbs}
          label="Carbs"
          unit="g"
          color="#eab308"
        />
        <ProgressRing
          value={nutrition.fat}
          max={targets.fat}
          label="Fat"
          unit="g"
          color="#f97316"
        />
        <ProgressRing
          value={nutrition.fiber}
          max={targets.fiber}
          label="Fiber"
          unit="g"
          color="#84cc16"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProgressRing
          value={nutrition.saturatedFat}
          max={targets.saturatedFat}
          label="Sat Fat"
          unit="g"
          color="#ec4899"
        />
        <ProgressRing
          value={nutrition.sugars}
          max={targets.sugars}
          label="Sugars"
          unit="g"
          color="#8b5cf6"
        />
        <ProgressRing
          value={totalSleep}
          max={targets.sleepHours || 8}
          label="Sleep"
          unit="h"
          color="#a855f7"
        />
        <ProgressRing
          value={dailyLog?.waterMl || 0}
          max={targets.waterMl}
          label="Water"
          unit="ml"
          color="#06b6d4"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Nutrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Energy (kcal)</span>
                  <span className="font-medium">{Math.round(nutrition.calories)} / {targets.calories}</span>
                </div>
                <Progress value={(nutrition.calories / targets.calories) * 100} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protein</span>
                  <span>{Math.round(nutrition.protein)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carbs</span>
                  <span>{Math.round(nutrition.carbs)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fat</span>
                  <span>{Math.round(nutrition.fat)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sat Fat</span>
                  <span>{Math.round(nutrition.saturatedFat)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fiber</span>
                  <span>{Math.round(nutrition.fiber)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sugars</span>
                  <span>{Math.round(nutrition.sugars)}g</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Exercise & Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Burned</span>
                <span className="font-bold">{Math.round(caloriesBurned)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Workouts:</span>
                  <span>{Math.round(caloriesBurned - Math.round((dailyLog?.steps || 0) * 0.05))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Steps ({Math.round((dailyLog?.steps || 0) * 0.05)} cal):</span>
                  <span>{dailyLog?.steps || 0}</span>
                </div>
              </div>
              <Progress value={((dailyLog?.steps || 0) / targets.steps) * 100} />
              <div className="flex justify-between text-sm">
                <span>Net Calories</span>
                <span className={`font-medium ${netCalories > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.round(netCalories)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Hydration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Water</span>
                <span className="font-medium">{(dailyLog?.waterMl || 0)}ml</span>
              </div>
              <Progress value={((dailyLog?.waterMl || 0) / targets.waterMl) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      {(dailyLog?.physiological) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Physiological Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dailyLog.physiological.heartRate && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Heart className="h-4 w-4 text-red-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{dailyLog.physiological.heartRate}</div>
                  <div className="text-xs text-muted-foreground">bpm</div>
                </div>
              )}
              {dailyLog.physiological.weight && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Scale className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{dailyLog.physiological.weight}</div>
                  <div className="text-xs text-muted-foreground">kg</div>
                </div>
              )}
              {dailyLog.physiological.waistCm && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Ruler className="h-4 w-4 text-green-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{dailyLog.physiological.waistCm}</div>
                  <div className="text-xs text-muted-foreground">cm</div>
                </div>
              )}
              {dailyLog.physiological.bodyTemp && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Thermometer className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{dailyLog.physiological.bodyTemp}°</div>
                  <div className="text-xs text-muted-foreground">C</div>
                </div>
              )}
              {dailyLog.physiological.bloodPressureSystolic && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">
                    {dailyLog.physiological.bloodPressureSystolic}/{dailyLog.physiological.bloodPressureDiastolic || '--'}
                  </div>
                  <div className="text-xs text-muted-foreground">Blood Pressure</div>
                </div>
              )}
              {dailyLog.physiological.bloodSugar && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{dailyLog.physiological.bloodSugar}</div>
                  <div className="text-xs text-muted-foreground">Blood Sugar mg/dL</div>
                </div>
              )}
              {dailyLog.physiological.oxygenSaturation && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold">{dailyLog.physiological.oxygenSaturation}%</div>
                  <div className="text-xs text-muted-foreground">O2 Saturation</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(dailyLog?.wellbeing?.mood || dailyLog?.wellbeing?.stress || dailyLog?.wellbeing?.energy) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Today's Wellbeing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {dailyLog.wellbeing.mood && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dailyLog.wellbeing.mood}</div>
                  <div className="text-xs text-muted-foreground">Mood</div>
                </div>
              )}
              {dailyLog.wellbeing.stress && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{dailyLog.wellbeing.stress}</div>
                  <div className="text-xs text-muted-foreground">Stress</div>
                </div>
              )}
              {dailyLog.wellbeing.energy && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">{dailyLog.wellbeing.energy}</div>
                  <div className="text-xs text-muted-foreground">Energy</div>
                </div>
              )}
            </div>
            {dailyLog.wellbeing.notes && (
              <div className="mt-3 p-2 bg-muted rounded text-sm">
                <div className="text-xs text-muted-foreground mb-1">Notes:</div>
                <div className="text-sm">{dailyLog.wellbeing.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {settings?.customMetrics && settings.customMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {settings.customMetrics.map((metric) => (
                <div key={metric.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{metric.name}</span>
                    <span className="font-medium">
                      {metric.type === 'boolean' 
                        ? (dailyLog?.customMetrics?.[metric.id] ? 'Yes' : 'No')
                        : `${dailyLog?.customMetrics?.[metric.id] || 0} ${metric.unit}`
                      }
                    </span>
                  </div>
                  {metric.type === 'number' && metric.target && (
                    <Progress 
                      value={((dailyLog?.customMetrics?.[metric.id] as number) || 0) / metric.target * 100} 
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Trend Analysis</CardTitle>
            <div className="flex gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem disabled value="nutrition-header">— Nutrition —</SelectItem>
                  <SelectItem value="calories">Calories In</SelectItem>
                  <SelectItem value="burned">Calories Burned</SelectItem>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="carbs">Carbohydrates</SelectItem>
                  <SelectItem value="fat">Fat</SelectItem>
                  <SelectItem value="fiber">Fiber</SelectItem>
                  <SelectItem value="sugars">Sugars</SelectItem>
                  <SelectItem value="saturatedFat">Saturated Fat</SelectItem>
                  <SelectItem disabled value="activity-header">— Activity —</SelectItem>
                  <SelectItem value="sleep">Sleep Hours</SelectItem>
                  <SelectItem value="steps">Steps</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem disabled value="wellbeing-header">— Wellbeing —</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                  <SelectItem value="stress">Stress</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem disabled value="physiological-header">— Physiological —</SelectItem>
                  <SelectItem value="heartRate">Heart Rate</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="waistCm">Waist</SelectItem>
                  <SelectItem value="bodyTemp">Body Temperature</SelectItem>
                  <SelectItem value="bloodSugar">Blood Sugar</SelectItem>
                  <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                  <SelectItem value="oxygenSaturation">O2 Saturation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={periodLogs?.map(({ date, log }) => {
              const nutrition = log ? calculateNutrition(log) : { calories: 0 };
              const burned = log ? calculateCaloriesBurned(log) : 0;
              const stepsBurned = Math.round((log?.steps || 0) * 0.05);
              const sleep = getTotalSleep(log);
              return {
                date,
                calories: Math.round(nutrition.calories),
                burned: Math.round(burned + stepsBurned),
                protein: Math.round(nutrition.protein),
                carbs: Math.round(nutrition.carbs),
                fat: Math.round(nutrition.fat),
                fiber: Math.round(nutrition.fiber),
                sugars: Math.round(nutrition.sugars),
                saturatedFat: Math.round(nutrition.saturatedFat),
                sleep: Math.round(sleep * 10) / 10,
                steps: log?.steps || 0,
                water: log?.waterMl || 0,
                mood: log?.wellbeing?.mood,
                stress: log?.wellbeing?.stress,
                energy: log?.wellbeing?.energy,
                heartRate: log?.physiological?.heartRate,
                weight: log?.physiological?.weight,
                waistCm: log?.physiological?.waistCm,
                bodyTemp: log?.physiological?.bodyTemp,
                bloodSugar: log?.physiological?.bloodSugar,
                bloodPressure: log?.physiological?.bloodPressureSystolic,
                oxygenSaturation: log?.physiological?.oxygenSaturation,
              };
            })}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={metricOptions.find(m => m.id === selectedMetric)?.color || '#3b82f6'}
                strokeWidth={2}
                name={metricOptions.find(m => m.id === selectedMetric)?.name || selectedMetric}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
