import { useEffect, useState } from 'react';
import { initializeSettings } from '@/lib/db';
import { DailyLogPage } from '@/components/daily-log/DailyLogPage';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { DataTools } from '@/components/settings/DataTools';

type Tab = 'dashboard' | 'log' | 'inventory' | 'settings';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

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
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Dashboard
          </button>
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
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Settings
          </button>
        </div>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'log' && <DailyLogPage />}
        {activeTab === 'inventory' && <InventoryPage />}
        {activeTab === 'settings' && <DataTools />}
      </main>
    </div>
  );
}

export default App;
