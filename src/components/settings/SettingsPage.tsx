import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db, DEFAULT_TARGETS, DEFAULT_CUSTOM_METRICS } from '@/lib/db';
import type { DailyTargets, CustomMetric } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Plus, Save } from 'lucide-react';
import { DataTools } from './DataTools';

export function SettingsPage() {
  const settings = useLiveQuery(() => db.userSettings.get('default'));
  const targets = settings?.dailyTargets || DEFAULT_TARGETS;
  const customMetrics = settings?.customMetrics || DEFAULT_CUSTOM_METRICS;

  const [editingTargets, setEditingTargets] = useState<DailyTargets>(targets);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);

  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<CustomMetric | null>(null);
  const [metricForm, setMetricForm] = useState({
    name: '',
    unit: '',
    target: '',
    type: 'number' as 'number' | 'boolean',
  });

  const handleSaveTargets = async () => {
    if (!settings) return;
    await db.userSettings.update('default', { dailyTargets: editingTargets });
    setTargetDialogOpen(false);
  };

  const handleEditMetric = (metric: CustomMetric) => {
    setEditingMetric(metric);
    setMetricForm({
      name: metric.name,
      unit: metric.unit,
      target: metric.target?.toString() || '',
      type: metric.type,
    });
    setMetricDialogOpen(true);
  };

  const handleAddMetric = () => {
    setEditingMetric(null);
    setMetricForm({ name: '', unit: '', target: '', type: 'number' });
    setMetricDialogOpen(true);
  };

  const handleSaveMetric = async () => {
    if (!metricForm.name || !metricForm.unit) return;

    const newMetric: CustomMetric = {
      id: editingMetric?.id || uuidv4(),
      name: metricForm.name,
      unit: metricForm.unit,
      target: metricForm.target ? Number(metricForm.target) : undefined,
      type: metricForm.type,
    };

    if (editingMetric) {
      const updated = customMetrics.map((m) => (m.id === editingMetric.id ? newMetric : m));
      await db.userSettings.update('default', { customMetrics: updated });
    } else {
      await db.userSettings.update('default', { customMetrics: [...customMetrics, newMetric] });
    }

    setMetricDialogOpen(false);
    setEditingMetric(null);
  };

  const handleDeleteMetric = async (id: string) => {
    const updated = customMetrics.filter((m) => m.id !== id);
    await db.userSettings.update('default', { customMetrics: updated });
  };

  const resetToDefaults = async () => {
    await db.userSettings.put({
      id: 'default',
      dailyTargets: DEFAULT_TARGETS,
      customMetrics: DEFAULT_CUSTOM_METRICS,
    });
    setEditingTargets(DEFAULT_TARGETS);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily Targets</CardTitle>
          <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingTargets(targets)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Daily Targets</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Energy</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>Calories (kcal)</Label>
                      <Input
                        type="number"
                        value={editingTargets.calories}
                        onChange={(e) => setEditingTargets({ ...editingTargets, calories: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Kilojoules (kJ)</Label>
                      <Input
                        type="number"
                        value={editingTargets.kilojoules}
                        onChange={(e) => setEditingTargets({ ...editingTargets, kilojoules: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Macronutrients</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>Protein (g)</Label>
                      <Input
                        type="number"
                        value={editingTargets.protein}
                        onChange={(e) => setEditingTargets({ ...editingTargets, protein: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Carbohydrates (g)</Label>
                      <Input
                        type="number"
                        value={editingTargets.carbs}
                        onChange={(e) => setEditingTargets({ ...editingTargets, carbs: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Fat (g)</Label>
                      <Input
                        type="number"
                        value={editingTargets.fat}
                        onChange={(e) => setEditingTargets({ ...editingTargets, fat: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Saturated Fat (g)</Label>
                      <Input
                        type="number"
                        value={editingTargets.saturatedFat}
                        onChange={(e) => setEditingTargets({ ...editingTargets, saturatedFat: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Carbohydrates Detail</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>Fiber (g)</Label>
                      <Input
                        type="number"
                        value={editingTargets.fiber}
                        onChange={(e) => setEditingTargets({ ...editingTargets, fiber: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sugars (g)</Label>
                      <Input
                        type="number"
                        value={editingTargets.sugars}
                        onChange={(e) => setEditingTargets({ ...editingTargets, sugars: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Other</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label>Steps</Label>
                      <Input
                        type="number"
                        value={editingTargets.steps}
                        onChange={(e) => setEditingTargets({ ...editingTargets, steps: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Water (ml)</Label>
                      <Input
                        type="number"
                        value={editingTargets.waterMl}
                        onChange={(e) => setEditingTargets({ ...editingTargets, waterMl: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sleep (hours)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={editingTargets.sleepHours}
                        onChange={(e) => setEditingTargets({ ...editingTargets, sleepHours: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveTargets} className="flex-1">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTargets(targets)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Energy</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Calories</div>
                  <div className="text-lg font-bold">{targets.calories}</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Kilojoules</div>
                  <div className="text-lg font-bold">{targets.kilojoules}</div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Macronutrients</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Protein</div>
                  <div className="text-lg font-bold">{targets.protein}g</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Carbs</div>
                  <div className="text-lg font-bold">{targets.carbs}g</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Fat</div>
                  <div className="text-lg font-bold">{targets.fat}g</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Sat Fat</div>
                  <div className="text-lg font-bold">{targets.saturatedFat}g</div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Carbs Detail</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Fiber</div>
                  <div className="text-lg font-bold">{targets.fiber}g</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Sugars</div>
                  <div className="text-lg font-bold">{targets.sugars}g</div>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Other</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Steps</div>
                  <div className="text-lg font-bold">{targets.steps}</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Water</div>
                  <div className="text-lg font-bold">{targets.waterMl}ml</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Sleep</div>
                  <div className="text-lg font-bold">{targets.sleepHours}h</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Custom Metrics</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button size="sm" onClick={handleAddMetric}>
              <Plus className="h-4 w-4 mr-1" />
              Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customMetrics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customMetrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell>{metric.unit}</TableCell>
                    <TableCell>{metric.target || '-'}</TableCell>
                    <TableCell>
                      <span className="capitalize">{metric.type}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditMetric(metric)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMetric(metric.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No custom metrics yet. Add your first one to track additional metrics.
            </p>
          )}
        </CardContent>
      </Card>

      <DataTools />

      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMetric ? 'Edit Metric' : 'Add Custom Metric'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={metricForm.name}
                onChange={(e) => setMetricForm({ ...metricForm, name: e.target.value })}
                placeholder="e.g., Sugar, Salt, Nicotine, Vitamin D"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={metricForm.unit}
                  onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })}
                  placeholder="e.g., g, mg, IU"
                />
              </div>
              <div className="space-y-2">
                <Label>Target (optional)</Label>
                <Input
                  type="number"
                  value={metricForm.target}
                  onChange={(e) => setMetricForm({ ...metricForm, target: e.target.value })}
                  placeholder="Daily goal"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={metricForm.type === 'boolean'}
                onCheckedChange={(checked) => setMetricForm({ ...metricForm, type: checked ? 'boolean' : 'number' })}
              />
              <Label>Toggle/Switch type (yes/no tracking)</Label>
            </div>
            <Button onClick={handleSaveMetric} className="w-full">
              {editingMetric ? 'Update' : 'Add'} Metric
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
