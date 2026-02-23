import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { format } from 'date-fns';

export function DataTools() {
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const foodCount = useLiveQuery(() => db.foodInventory.count());
  const workoutCount = useLiveQuery(() => db.workoutInventory.count());
  const logCount = useLiveQuery(() => db.dailyLogs.count());

  const handleExport = async () => {
    try {
      const foodItems = await db.foodInventory.toArray();
      const workoutItems = await db.workoutInventory.toArray();
      const activityItems = await db.activityInventory.toArray();
      const dailyLogs = await db.dailyLogs.toArray();
      const settings = await db.userSettings.get('default');

      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
          foodInventory: foodItems,
          workoutInventory: workoutItems,
          activityInventory: activityItems,
          dailyLogs: dailyLogs,
          userSettings: settings,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wellbeing_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.version || !importData.data) {
        throw new Error('Invalid backup file format');
      }

      const { foodInventory, workoutInventory, activityInventory, dailyLogs, userSettings } = importData.data;

      if (importMode === 'overwrite') {
        await db.foodInventory.clear();
        await db.workoutInventory.clear();
        await db.activityInventory.clear();
        await db.dailyLogs.clear();
      }

      if (foodInventory?.length) {
        await db.foodInventory.bulkPut(foodInventory);
      }
      if (workoutInventory?.length) {
        await db.workoutInventory.bulkPut(workoutInventory);
      }
      if (activityInventory?.length) {
        await db.activityInventory.bulkPut(activityInventory);
      }
      if (dailyLogs?.length) {
        await db.dailyLogs.bulkPut(dailyLogs);
      }
      if (userSettings) {
        await db.userSettings.put(userSettings);
      }

      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{foodCount || 0}</div>
            <div className="text-sm text-muted-foreground">Food Items</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{workoutCount || 0}</div>
            <div className="text-sm text-muted-foreground">Workout Items</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{logCount || 0}</div>
            <div className="text-sm text-muted-foreground">Daily Logs</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Data</Label>
            <p className="text-sm text-muted-foreground">
              Download all your data as a JSON file. This includes food, workouts, and daily logs.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export Backup
              </Button>
              {exportStatus === 'success' && (
                <span className="flex items-center text-green-500 text-sm gap-1">
                  <CheckCircle className="h-4 w-4" /> Exported!
                </span>
              )}
              {exportStatus === 'error' && (
                <span className="flex items-center text-red-500 text-sm gap-1">
                  <AlertCircle className="h-4 w-4" /> Failed
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Import Data</Label>
            <p className="text-sm text-muted-foreground">
              Restore data from a backup file. Choose merge to keep existing data or overwrite to replace.
            </p>
            <div className="flex gap-2 items-center">
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'merge' | 'overwrite')}
                className="px-3 py-2 border rounded-md"
              >
                <option value="merge">Merge (add to existing)</option>
                <option value="overwrite">Overwrite (replace all)</option>
              </select>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Import Backup
              </Button>
              {importStatus === 'success' && (
                <span className="flex items-center text-green-500 text-sm gap-1">
                  <CheckCircle className="h-4 w-4" /> Imported!
                </span>
              )}
              {importStatus === 'error' && (
                <span className="flex items-center text-red-500 text-sm gap-1">
                  <AlertCircle className="h-4 w-4" /> Invalid file
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
