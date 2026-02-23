import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Profile } from '@/lib/types';

interface ProfileContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
  switchProfile: (id: string) => Promise<void>;
  addProfile: (name: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  
  const profiles = useLiveQuery(() => db.profiles.toArray()) || [];

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const allProfiles = await db.profiles.toArray();
      
      if (allProfiles.length === 0) {
        const defaultId = 'default';
        await db.profiles.add({
          id: defaultId,
          name: 'Default',
          createdAt: new Date(),
          isActive: true,
        });
        setCurrentProfileId(defaultId);
      } else {
        const activeProfile = allProfiles.find(p => p.isActive);
        if (activeProfile) {
          setCurrentProfileId(activeProfile.id);
        } else {
          await db.profiles.update(allProfiles[0].id, { isActive: true });
          setCurrentProfileId(allProfiles[0].id);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const currentProfile = profiles.find(p => p.id === currentProfileId) || null;

  const switchProfile = async (id: string) => {
    if (currentProfileId) {
      await db.profiles.update(currentProfileId, { isActive: false });
    }
    await db.profiles.update(id, { isActive: true });
    setCurrentProfileId(id);
  };

  const addProfile = async (name: string) => {
    const id = crypto.randomUUID();
    await db.profiles.add({
      id,
      name,
      createdAt: new Date(),
      isActive: false,
    });
  };

  const deleteProfile = async (id: string) => {
    await db.profiles.delete(id);
    await db.dailyLogs.where('profileId').equals(id).delete();
    await db.userSettings.delete(id);
    const remaining = await db.profiles.toArray();
    if (remaining.length > 0) {
      await db.profiles.update(remaining[0].id, { isActive: true });
      setCurrentProfileId(remaining[0].id);
    } else {
      setCurrentProfileId(null);
    }
  };

  return (
    <ProfileContext.Provider value={{ currentProfile, profiles, switchProfile, addProfile, deleteProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
