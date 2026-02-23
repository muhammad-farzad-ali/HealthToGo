import { useLiveQuery } from 'dexie-react-hooks';
import { format, subDays } from 'date-fns';
import { db, DEFAULT_TARGETS } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Utensils, Dumbbell, Droplets } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
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

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(formatDate(subDays(new Date(), i)));
    }
    return days;
  };

  const weekLogs = useLiveQuery(async () => {
    const dates = getLast7Days();
    const logs = await Promise.all(
      dates.map(date => db.dailyLogs.get(date))
    );
    return logs.map((log, i) => ({
      date: format(subDays(new Date(), 6 - i), 'EEE'),
      fullDate: dates[i],
      log: log || null,
    }));
  }, []);

  const calculateNutrition = (log: any) => {
    if (!log || !foodInventory) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return log.foodItems.reduce(
      (acc: any, item: any) => {
        const food = foodInventory.find((f) => f.id === item.inventoryId);
        if (food) {
          acc.calories += food.calories * item.quantity;
          acc.protein += food.protein * item.quantity;
          acc.carbs += food.carbs * item.quantity;
          acc.fat += food.fat * item.quantity;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const calculateCaloriesBurned = (log: any) => {
    if (!log || !workoutInventory) return 0;
    return log.workoutItems.reduce((acc: number, item: any) => {
      const workout = workoutInventory.find((w) => w.id === item.inventoryId);
      if (workout) {
        acc += workout.caloriesPerUnit * item.quantity;
      }
      return acc;
    }, 0);
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

  const nutrition = dailyLog ? calculateNutrition(dailyLog) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const caloriesBurned = dailyLog ? calculateCaloriesBurned(dailyLog) : 0;
  const totalSleep = dailyLog ? getTotalSleep(dailyLog) : 0;
  const netCalories = nutrition.calories - caloriesBurned;

  const chartData = weekLogs?.map(({ date, log }) => {
    const weekNutrition = log ? calculateNutrition(log) : { calories: 0 };
    const weekBurned = log ? calculateCaloriesBurned(log) : 0;
    const weekSleep = log ? getTotalSleep(log) : 0;
    return {
      date,
      calories: Math.round(weekNutrition.calories),
      burned: Math.round(weekBurned),
      sleep: Math.round(weekSleep * 10) / 10,
      steps: log?.steps || 0,
      water: log?.waterMl || 0,
    };
  }) || [];

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
          unit=""
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
          value={dailyLog?.steps || 0}
          max={targets.steps}
          label="Steps"
          unit=""
          color="#3b82f6"
        />
        <ProgressRing
          value={totalSleep}
          max={8}
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
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calories In</span>
                <span className="font-medium">{Math.round(nutrition.calories)}</span>
              </div>
              <Progress value={(nutrition.calories / targets.calories) * 100} />
              <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div>P: {Math.round(nutrition.protein)}g</div>
                <div>C: {Math.round(nutrition.carbs)}g</div>
                <div>F: {Math.round(nutrition.fat)}g</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Exercise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calories Burned</span>
                <span className="font-medium">{Math.round(caloriesBurned)}</span>
              </div>
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
              <div className="flex justify-between text-sm">
                <span>Caffeine</span>
                <span className="font-medium">{(dailyLog?.caffeineMg || 0)}mg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calories" className="w-full">
        <TabsList>
          <TabsTrigger value="calories">Calories</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Calorie Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#ef4444"
                    fill="#fecaca"
                    name="Calories In"
                  />
                  <Line
                    type="monotone"
                    dataKey="burned"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Calories Burned"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sleep" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Sleep Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 12]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    stroke="#a855f7"
                    strokeWidth={2}
                    name="Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>7-Day Activity Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="steps"
                    stroke="#3b82f6"
                    fill="#bfdbfe"
                    name="Steps"
                  />
                  <Area
                    type="monotone"
                    dataKey="water"
                    stroke="#06b6d4"
                    fill="#cffafe"
                    name="Water (ml)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
