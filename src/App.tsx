import { useEffect, useState } from 'react';
import { initializeSettings } from '@/lib/db';
import { DailyLogPage } from '@/components/daily-log/DailyLogPage';
import { InventoryPage } from '@/components/inventory/InventoryPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'log' | 'inventory'>('log');

  useEffect(() => {
    initializeSettings().then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold">HealthToGo</h1>
          <p className="text-sm text-muted-foreground">Your offline wellness companion</p>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'log'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Daily Log
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'inventory'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Inventory
          </button>
        </div>
        {activeTab === 'log' ? <DailyLogPage /> : <InventoryPage />}
      </main>
    </div>
  );
}

export default App;
