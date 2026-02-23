import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import type { WorkoutItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function WorkoutInventory() {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkoutItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    caloriesPerUnit: '',
    unit: 'minutes' as 'minutes' | 'reps' | 'sets',
  });

  const workoutItems = useLiveQuery(() => db.workoutInventory.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    
    if (editingItem) {
      await db.workoutInventory.update(editingItem.id, {
        name: formData.name,
        caloriesPerUnit: Number(formData.caloriesPerUnit),
        unit: formData.unit,
        updatedAt: now,
      });
    } else {
      await db.workoutInventory.add({
        id: uuidv4(),
        name: formData.name,
        caloriesPerUnit: Number(formData.caloriesPerUnit),
        unit: formData.unit,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    resetForm();
  };

  const handleEdit = (item: WorkoutItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      caloriesPerUnit: item.caloriesPerUnit.toString(),
      unit: item.unit,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await db.workoutInventory.delete(id);
  };

  const resetForm = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({ name: '', caloriesPerUnit: '', unit: 'minutes' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Workout Inventory</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Workout' : 'Add New Workout'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Running"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caloriesPerUnit">Calories per unit</Label>
                  <Input
                    id="caloriesPerUnit"
                    type="number"
                    min="0"
                    value={formData.caloriesPerUnit}
                    onChange={(e) => setFormData({ ...formData, caloriesPerUnit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: 'minutes' | 'reps' | 'sets') => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="reps">Reps</SelectItem>
                      <SelectItem value="sets">Sets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? 'Update' : 'Add'} Workout
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {workoutItems && workoutItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cal/Unit</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workoutItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.caloriesPerUnit}</Badge>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
            No workout items yet. Add your first workout to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
