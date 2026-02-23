import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, subDays } from 'date-fns';
import { db, DEFAULT_TARGETS } from '@/lib/db';
import type { DailyLog, PhysiologicalMetrics, WellbeingMetrics } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Trash2, Utensils, Dumbbell, Moon, Coffee, Timer, Monitor, Brain, Activity, Scale, Ruler, Heart, Thermometer, Save } from 'lucide-react';

function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function getEmptyDailyLog(date: string): DailyLog {
  return {
    date,
    foodItems: [],
    workoutItems: [],
    steps: 0,
    sleepSessions: [],
    waterMl: 0,
    caffeineMg: 0,
    workMins: 0,
    screenMins: 0,
    meditationMins: 0,
    customMetrics: {},
    physiological: {},
    wellbeing: {},
    bowelMovements: [],
  };
}

export function DailyLogPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateKey = formatDate(currentDate);
  
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [sleepDialogOpen, setSleepDialogOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('1');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [workoutQuantity, setWorkoutQuantity] = useState('1');
  const [sleepStart, setSleepStart] = useState('22:00');
  const [sleepEnd, setSleepEnd] = useState('07:00');

  const dailyLog = useLiveQuery(async () => {
    const log = await db.dailyLogs.get(dateKey);
    return log || getEmptyDailyLog(dateKey);
  }, [dateKey]);

  const foodInventory = useLiveQuery(() => db.foodInventory.toArray());
  const workoutInventory = useLiveQuery(() => db.workoutInventory.toArray());
  const settings = useLiveQuery(() => db.userSettings.get('default'));
  const targets = settings?.dailyTargets || DEFAULT_TARGETS;

  const calculateNutrition = () => {
    if (!dailyLog || !foodInventory) return { 
      calories: 0, kilojoules: 0, protein: 0, carbs: 0, fiber: 0, sugars: 0, addedSugars: 0, fat: 0, saturatedFat: 0 
    };
    
    return dailyLog.foodItems.reduce(
      (acc, logged) => {
        const food = foodInventory.find((f) => f.id === logged.inventoryId);
        if (food) {
          const qty = logged.quantity;
          acc.calories += (food.calories || 0) * qty;
          acc.kilojoules += (food.kilojoules || 0) * qty;
          acc.protein += (food.protein || 0) * qty;
          acc.carbs += (food.carbs || 0) * qty;
          acc.fiber += (food.fiber || 0) * qty;
          acc.sugars += (food.sugars || 0) * qty;
          acc.addedSugars += (food.addedSugars || 0) * qty;
          acc.fat += (food.fat || 0) * qty;
          acc.saturatedFat += (food.saturatedFat || 0) * qty;
        }
        return acc;
      },
      { calories: 0, kilojoules: 0, protein: 0, carbs: 0, fiber: 0, sugars: 0, addedSugars: 0, fat: 0, saturatedFat: 0 }
    );
  };

  const calculateCaloriesBurned = () => {
    let burned = 0;
    if (dailyLog?.workoutItems && workoutInventory) {
      burned = dailyLog.workoutItems.reduce((acc, logged) => {
        const workout = workoutInventory.find((w) => w.id === logged.inventoryId);
        if (workout) {
          acc += workout.caloriesPerUnit * logged.quantity;
        }
        return acc;
      }, 0);
    }
    const stepsCalories = Math.round((dailyLog?.steps || 0) * 0.05);
    return burned + stepsCalories;
  };

  const nutrition = calculateNutrition();
  const caloriesBurned = calculateCaloriesBurned();

  const ensureLogExists = async () => {
    const existing = await db.dailyLogs.get(dateKey);
    if (!existing) {
      await db.dailyLogs.add(getEmptyDailyLog(dateKey));
    }
  };

  const addFood = async () => {
    if (!selectedFoodId) return;
    await ensureLogExists();
    
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    
    const newFoodItems = [
      ...log.foodItems,
      { id: uuidv4(), inventoryId: selectedFoodId, quantity: Number(foodQuantity) },
    ];
    
    await db.dailyLogs.update(dateKey, { foodItems: newFoodItems });
    
    setFoodDialogOpen(false);
    setSelectedFoodId('');
    setFoodQuantity('1');
  };

  const removeFood = async (index: number) => {
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    const newFoodItems = log.foodItems.filter((_, i) => i !== index);
    await db.dailyLogs.update(dateKey, { foodItems: newFoodItems });
  };

  const addWorkout = async () => {
    if (!selectedWorkoutId) return;
    await ensureLogExists();
    
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    
    const newWorkoutItems = [
      ...log.workoutItems,
      { id: uuidv4(), inventoryId: selectedWorkoutId, quantity: Number(workoutQuantity) },
    ];
    
    await db.dailyLogs.update(dateKey, { workoutItems: newWorkoutItems });
    
    setWorkoutDialogOpen(false);
    setSelectedWorkoutId('');
    setWorkoutQuantity('1');
  };

  const removeWorkout = async (index: number) => {
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    const newWorkoutItems = log.workoutItems.filter((_, i) => i !== index);
    await db.dailyLogs.update(dateKey, { workoutItems: newWorkoutItems });
  };

  const addSleepSession = async () => {
    await ensureLogExists();
    
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    
    const newSleepSessions = [
      ...log.sleepSessions,
      { id: uuidv4(), startTime: sleepStart, endTime: sleepEnd },
    ];
    
    await db.dailyLogs.update(dateKey, { sleepSessions: newSleepSessions });
    
    setSleepDialogOpen(false);
    setSleepStart('22:00');
    setSleepEnd('07:00');
  };

  const removeSleep = async (index: number) => {
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    const newSleepSessions = log.sleepSessions.filter((_, i) => i !== index);
    await db.dailyLogs.update(dateKey, { sleepSessions: newSleepSessions });
  };

  const updateField = async (field: keyof DailyLog, value: number) => {
    await ensureLogExists();
    await db.dailyLogs.update(dateKey, { [field]: value } as any);
  };

  const updateCustomMetric = async (metricId: string, value: number | boolean) => {
    await ensureLogExists();
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    const currentMetrics = log.customMetrics || {};
    await db.dailyLogs.update(dateKey, {
      customMetrics: { ...currentMetrics, [metricId]: value },
    });
  };

  const updatePhysiological = async (field: keyof PhysiologicalMetrics, value: number | undefined) => {
    await ensureLogExists();
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    const current = log.physiological || {};
    await db.dailyLogs.update(dateKey, {
      physiological: { ...current, [field]: value },
    });
  };

  const updateWellbeing = async (field: keyof WellbeingMetrics, value: string | number | undefined) => {
    await ensureLogExists();
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    const current = log.wellbeing || {};
    await db.dailyLogs.update(dateKey, {
      wellbeing: { ...current, [field]: value },
    });
  };

  const addBowelMovement = async (consistency?: 1|2|3|4|5|6|7, discomfort?: 'none'|'mild'|'moderate'|'severe') => {
    await ensureLogExists();
    const log = await db.dailyLogs.get(dateKey);
    if (!log) return;
    const movements = log.bowelMovements || [];
    await db.dailyLogs.update(dateKey, {
      bowelMovements: [...movements, { id: uuidv4(), time: new Date().toISOString(), consistency, discomfort }],
    });
  };

  const getFoodName = (id: string) => foodInventory?.find((f) => f.id === id)?.name || 'Unknown';
  const getWorkoutName = (id: string) => workoutInventory?.find((w) => w.id === id)?.name || 'Unknown';

  const getSleepDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let duration = (endH + 24 - startH) % 24 + (endM - startM) / 60;
    return Math.round(duration * 10) / 10;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" onClick={() => setCurrentDate(new Date())}>Today</Button>
        <Button variant="default" onClick={async () => {
          await ensureLogExists();
        }} className="gap-1">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Nutrition
            </CardTitle>
            <Dialog open={foodDialogOpen} onOpenChange={setFoodDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Food</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Food Item</Label>
                    <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select food" />
                      </SelectTrigger>
                      <SelectContent>
                        {foodInventory?.map((food) => (
                          <SelectItem key={food.id} value={food.id}>{food.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={foodQuantity}
                      onChange={(e) => setFoodQuantity(e.target.value)}
                    />
                  </div>
                  <Button onClick={addFood} className="w-full">Add Food</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Energy</span>
                  <span>{Math.round(nutrition.calories)} / {targets.calories} kcal</span>
                </div>
                <Progress value={(nutrition.calories / targets.calories) * 100} />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {Math.round(nutrition.kilojoules)} / {targets.kilojoules} kJ
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="text-muted-foreground">Protein</div>
                  <div className="font-medium">{Math.round(nutrition.protein)}g</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Carbs</div>
                  <div className="font-medium">{Math.round(nutrition.carbs)}g</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Fat</div>
                  <div className="font-medium">{Math.round(nutrition.fat)}g</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sat Fat</div>
                  <div className="font-medium">{Math.round(nutrition.saturatedFat)}g</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <div className="text-muted-foreground">Fiber</div>
                  <div className="font-medium">{Math.round(nutrition.fiber)}g</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sugars</div>
                  <div className="font-medium">{Math.round(nutrition.sugars)}g</div>
                </div>
              </div>

              {dailyLog?.foodItems.length ? (
                <ScrollArea className="h-[150px]">
                  <Table>
                    <TableBody>
                      {dailyLog.foodItems.map((item, index) => (
                        <TableRow key={item.id} className="h-8">
                          <TableCell className="py-1">{getFoodName(item.inventoryId)}</TableCell>
                          <TableCell className="py-1 text-right">x{item.quantity}</TableCell>
                          <TableCell className="py-1 w-[40px]">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFood(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-2">No food logged</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Exercise
            </CardTitle>
            <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Workout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Workout</Label>
                    <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workout" />
                      </SelectTrigger>
                      <SelectContent>
                        {workoutInventory?.map((workout) => (
                          <SelectItem key={workout.id} value={workout.id}>{workout.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={workoutQuantity}
                      onChange={(e) => setWorkoutQuantity(e.target.value)}
                    />
                  </div>
                  <Button onClick={addWorkout} className="w-full">Add Workout</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Burned</span>
                  <span className="font-bold">{Math.round(caloriesBurned)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Workouts:</span>
                    <span>{Math.round(caloriesBurned - Math.round((dailyLog?.steps || 0) * 0.05))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Steps:</span>
                    <span>{Math.round((dailyLog?.steps || 0) * 0.05)}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Steps</span>
                  <span>{dailyLog?.steps || 0} / {targets.steps}</span>
                </div>
                <Progress value={((dailyLog?.steps || 0) / targets.steps) * 100} />
                <Input
                  type="number"
                  min="0"
                  value={dailyLog?.steps || 0}
                  onChange={(e) => updateField('steps', Number(e.target.value))}
                  placeholder="Enter steps"
                  className="mt-2"
                />
              </div>
              {dailyLog?.workoutItems.length ? (
                <ScrollArea className="h-[180px]">
                  <Table>
                    <TableBody>
                      {dailyLog.workoutItems.map((item, index) => (
                        <TableRow key={item.id} className="h-8">
                          <TableCell className="py-1">{getWorkoutName(item.inventoryId)}</TableCell>
                          <TableCell className="py-1 text-right">x{item.quantity}</TableCell>
                          <TableCell className="py-1 w-[40px]">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeWorkout(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-2">No workouts logged</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Hydration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Water</span>
                  <span>{(dailyLog?.waterMl || 0)} / {targets.waterMl} ml</span>
                </div>
                <Progress value={((dailyLog?.waterMl || 0) / targets.waterMl) * 100} />
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => updateField('waterMl', (dailyLog?.waterMl || 0) + 250)}>+250ml</Button>
                  <Button variant="outline" size="sm" onClick={() => updateField('waterMl', (dailyLog?.waterMl || 0) + 500)}>+500ml</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Sleep
            </CardTitle>
            <Dialog open={sleepDialogOpen} onOpenChange={setSleepDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Sleep Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bedtime</Label>
                    <Input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Wake up</Label>
                    <Input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />
                  </div>
                  <Button onClick={addSleepSession} className="w-full">Add Sleep</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {dailyLog?.sleepSessions.length ? (
              <ScrollArea className="h-[180px]">
                <Table>
                  <TableBody>
                    {dailyLog.sleepSessions.map((session, index) => (
                      <TableRow key={session.id} className="h-8">
                        <TableCell className="py-1">{session.startTime} - {session.endTime}</TableCell>
                        <TableCell className="py-1 text-right">
                          <Badge variant="secondary">{getSleepDuration(session.startTime, session.endTime)}h</Badge>
                        </TableCell>
                        <TableCell className="py-1 w-[40px]">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSleep(index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-2">No sleep logged</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Work & Screen Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Work (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={dailyLog?.workMins || 0}
                  onChange={(e) => updateField('workMins', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Monitor className="h-3 w-3" />
                  Screen Time (minutes)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={dailyLog?.screenMins || 0}
                  onChange={(e) => updateField('screenMins', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Brain className="h-3 w-3" />
                  Meditation (minutes)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={dailyLog?.meditationMins || 0}
                  onChange={(e) => updateField('meditationMins', Number(e.target.value))}
                />
              </div>
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Physiological Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  Heart Rate
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="bpm"
                  value={dailyLog?.physiological?.heartRate || ''}
                  onChange={(e) => updatePhysiological('heartRate', Number(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Scale className="h-3 w-3 text-blue-500" />
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="kg"
                  value={dailyLog?.physiological?.weight || ''}
                  onChange={(e) => updatePhysiological('weight', Number(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-green-500" />
                  Waist (cm)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="cm"
                  value={dailyLog?.physiological?.waistCm || ''}
                  onChange={(e) => updatePhysiological('waistCm', Number(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-orange-500" />
                  Body Temp (°C)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="°C"
                  value={dailyLog?.physiological?.bodyTemp || ''}
                  onChange={(e) => updatePhysiological('bodyTemp', Number(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Blood Pressure Sys</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="mmHg"
                  value={dailyLog?.physiological?.bloodPressureSystolic || ''}
                  onChange={(e) => updatePhysiological('bloodPressureSystolic', Number(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Blood Pressure Dia</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="mmHg"
                  value={dailyLog?.physiological?.bloodPressureDiastolic || ''}
                  onChange={(e) => updatePhysiological('bloodPressureDiastolic', Number(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Blood Sugar (mg/dL)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="mg/dL"
                  value={dailyLog?.physiological?.bloodSugar || ''}
                  onChange={(e) => updatePhysiological('bloodSugar', Number(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">O2 Saturation (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={dailyLog?.physiological?.oxygenSaturation || ''}
                  onChange={(e) => updatePhysiological('oxygenSaturation', Number(e.target.value) || undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Mood & Wellbeing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Mood (1-10)</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateWellbeing('mood', num)}
                    className={`flex-1 py-2 text-xs rounded transition-colors ${
                      dailyLog?.wellbeing?.mood === num 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Stress Level (1-10)</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateWellbeing('stress', num)}
                    className={`flex-1 py-2 text-xs rounded transition-colors ${
                      dailyLog?.wellbeing?.stress === num 
                        ? 'bg-red-500 text-white' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Energy Level (1-10)</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateWellbeing('energy', num)}
                    className={`flex-1 py-2 text-xs rounded transition-colors ${
                      dailyLog?.wellbeing?.energy === num 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Exhausted</span>
                <span>Energized</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Journal / Notes</Label>
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-md text-sm"
                placeholder="How are you feeling today? Any notes..."
                value={dailyLog?.wellbeing?.notes || ''}
                onChange={(e) => updateWellbeing('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Bowel Movements (Bristol Scale)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Consistency (1-7)</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7].map(consistency => (
                  <button
                    key={consistency}
                    type="button"
                    onClick={() => addBowelMovement(consistency as 1|2|3|4|5|6|7)}
                    className={`flex-1 py-2 text-xs rounded transition-colors ${
                      dailyLog?.bowelMovements?.some(b => b.consistency === consistency) 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {consistency}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Hard</span>
                <span>Normal</span>
                <span>Loose</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Discomfort</Label>
              <Select 
                value={dailyLog?.bowelMovements?.[0]?.discomfort || ''}
                onValueChange={(val) => addBowelMovement(undefined, val as 'none'|'mild'|'moderate'|'severe')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discomfort level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dailyLog?.bowelMovements && dailyLog.bowelMovements.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Recorded: {dailyLog.bowelMovements.length} time(s)
              </div>
            )}
          </CardContent>
        </Card>

          {settings?.customMetrics && settings.customMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Custom Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.customMetrics.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <Label className="text-sm">
                        {metric.name} {metric.target && `(${metric.target} ${metric.unit} target)`}
                      </Label>
                      {metric.type === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!!dailyLog?.customMetrics?.[metric.id]}
                            onCheckedChange={(checked) => updateCustomMetric(metric.id, checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {dailyLog?.customMetrics?.[metric.id] ? 'Yes' : 'No'}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          value={(dailyLog?.customMetrics?.[metric.id] as number) || 0}
                          onChange={(e) => updateCustomMetric(metric.id, Number(e.target.value))}
                          placeholder={`Enter ${metric.name.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
