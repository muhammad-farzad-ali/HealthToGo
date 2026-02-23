import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FoodInventory } from './FoodInventory';
import { WorkoutInventory } from './WorkoutInventory';

export function InventoryPage() {
  return (
    <Tabs defaultValue="food" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="food">Food</TabsTrigger>
        <TabsTrigger value="workout">Workouts</TabsTrigger>
      </TabsList>
      <TabsContent value="food">
        <FoodInventory />
      </TabsContent>
      <TabsContent value="workout">
        <WorkoutInventory />
      </TabsContent>
    </Tabs>
  );
}
