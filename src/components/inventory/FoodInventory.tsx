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
    protein: '',
    carbs: '',
    fat: '',
  });

  const foodItems = useLiveQuery(() => db.foodInventory.toArray());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    
    if (editingItem) {
      await db.foodInventory.update(editingItem.id, {
        name: formData.name,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        updatedAt: now,
      });
    } else {
      await db.foodInventory.add({
        id: uuidv4(),
        name: formData.name,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
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
      calories: item.calories.toString(),
      protein: item.protein.toString(),
      carbs: item.carbs.toString(),
      fat: item.fat.toString(),
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await db.foodInventory.delete(id);
  };

  const resetForm = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({ name: '', calories: '', protein: '', carbs: '', fat: '' });
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
          <DialogContent>
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
                  placeholder="e.g., Chicken Breast"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    required
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cal</TableHead>
                <TableHead>Protein</TableHead>
                <TableHead>Carbs</TableHead>
                <TableHead>Fat</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foodItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.calories}</Badge>
                  </TableCell>
                  <TableCell>{item.protein}g</TableCell>
                  <TableCell>{item.carbs}g</TableCell>
                  <TableCell>{item.fat}g</TableCell>
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
            No food items yet. Add your first food to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
