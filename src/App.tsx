import { useEffect, useState } from 'react';
import { ProfileProvider, useProfile } from '@/hooks/useProfile';
import { initializeSettings } from '@/lib/db';
import { DailyLogPage } from '@/components/daily-log/DailyLogPage';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SettingsPage } from '@/components/settings/SettingsPage';

type Tab = 'dashboard' | 'log' | 'inventory' | 'settings';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { currentProfile, profiles, switchProfile, addProfile, deleteProfile } = useProfile();

  useEffect(() => {
    if (currentProfile) {
      initializeSettings(currentProfile.id).then(() => setIsLoading(false));
    }
  }, [currentProfile?.id]);

  if (isLoading || !currentProfile) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">HealthToGo</h1>
              <p className="text-sm text-muted-foreground">Your offline wellness companion</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={currentProfile.id}
                onChange={(e) => switchProfile(e.target.value)}
                className="px-3 py-1 border rounded-md bg-background"
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const name = prompt('Enter profile name:');
                  if (name) addProfile(name);
                }}
                className="px-2 py-1 text-sm border rounded-md hover:bg-muted"
              >
                + Add
              </button>
              {profiles.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Delete profile "${currentProfile.name}"?`)) {
                      deleteProfile(currentProfile.id);
                    }
                  }}
                  className="px-2 py-1 text-sm text-red-500 border border-red-500 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
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
        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}

export default App;
