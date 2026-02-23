import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import type { FoodItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function FoodInventory() {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    kilojoules: '',
    protein: '',
    carbs: '',
    fiber: '',
    sugars: '',
    addedSugars: '',
    fat: '',
    saturatedFat: '',
  });

  const foodItems = useLiveQuery(() => db.foodInventory.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    
    if (editingItem) {
      await db.foodInventory.update(editingItem.id, {
        name: formData.name,
        calories: Number(formData.calories) || 0,
        kilojoules: Number(formData.kilojoules) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fiber: Number(formData.fiber) || 0,
        sugars: Number(formData.sugars) || 0,
        addedSugars: Number(formData.addedSugars) || 0,
        fat: Number(formData.fat) || 0,
        saturatedFat: Number(formData.saturatedFat) || 0,
        updatedAt: now,
      });
    } else {
      await db.foodInventory.add({
        id: uuidv4(),
        name: formData.name,
        calories: Number(formData.calories) || 0,
        kilojoules: Number(formData.kilojoules) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fiber: Number(formData.fiber) || 0,
        sugars: Number(formData.sugars) || 0,
        addedSugars: Number(formData.addedSugars) || 0,
        fat: Number(formData.fat) || 0,
        saturatedFat: Number(formData.saturatedFat) || 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    resetForm();
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      calories: item.calories?.toString() || '',
      kilojoules: item.kilojoules?.toString() || '',
      protein: item.protein?.toString() || '',
      carbs: item.carbs?.toString() || '',
      fiber: item.fiber?.toString() || '',
      sugars: item.sugars?.toString() || '',
      addedSugars: item.addedSugars?.toString() || '',
      fat: item.fat?.toString() || '',
      saturatedFat: item.saturatedFat?.toString() || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await db.foodInventory.delete(id);
  };

  const resetForm = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      calories: '',
      kilojoules: '',
      protein: '',
      carbs: '',
      fiber: '',
      sugars: '',
      addedSugars: '',
      fat: '',
      saturatedFat: '',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Food Inventory</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Food
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Food' : 'Add New Food'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chicken Breast, Whole Milk"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Energy (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="e.g., 165"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kilojoules">Energy (kJ)</Label>
                  <Input
                    id="kilojoules"
                    type="number"
                    min="0"
                    value={formData.kilojoules}
                    onChange={(e) => setFormData({ ...formData, kilojoules: e.target.value })}
                    placeholder="e.g., 690"
                  />
                  <p className="text-xs text-muted-foreground">Auto: 1 kcal = 4.184 kJ</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Total Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbohydrates (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saturatedFat">Saturated Fat (g)</Label>
                  <Input
                    id="saturatedFat"
                    type="number"
                    min="0"
                    value={formData.saturatedFat}
                    onChange={(e) => setFormData({ ...formData, saturatedFat: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                    placeholder="Dietary fiber"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugars">Total Sugars (g)</Label>
                  <Input
                    id="sugars"
                    type="number"
                    min="0"
                    value={formData.sugars}
                    onChange={(e) => setFormData({ ...formData, sugars: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addedSugars">Added Sugars (g)</Label>
                  <Input
                    id="addedSugars"
                    type="number"
                    min="0"
                    value={formData.addedSugars}
                    onChange={(e) => setFormData({ ...formData, addedSugars: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingItem ? 'Update' : 'Add'} Food
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {foodItems && foodItems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cal</TableHead>
                  <TableHead>kJ</TableHead>
                  <TableHead>Protein</TableHead>
                  <TableHead>Carbs</TableHead>
                  <TableHead>Fiber</TableHead>
                  <TableHead>Sugars</TableHead>
                  <TableHead>Fat</TableHead>
                  <TableHead>Sat Fat</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="secondary">{item.calories || 0}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{item.kilojoules || 0}</TableCell>
                    <TableCell>{item.protein || 0}g</TableCell>
                    <TableCell>{item.carbs || 0}g</TableCell>
                    <TableCell>{item.fiber || 0}g</TableCell>
                    <TableCell>{item.sugars || 0}g</TableCell>
                    <TableCell>{item.fat || 0}g</TableCell>
                    <TableCell>{item.saturatedFat || 0}g</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
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
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No food items yet. Add your first food to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
