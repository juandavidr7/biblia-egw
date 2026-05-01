"use client";
import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/types/reading-plan";

const STORAGE_KEY = "biblia-egw-profile";
const PIN = "1234";

const defaultProfile = (): UserProfile => ({
  completedDays: [],
  currentDay: 1,
  lastSeen: new Date().toISOString(),
});

export function useProfile() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch { /**/ }
    }
  }, []);

  const save = useCallback((p: UserProfile) => {
    setProfile(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }, []);

  const login = useCallback((pin: string): boolean => {
    if (pin !== PIN) return false;
    setIsAuthenticated(true);
    return true;
  }, []);

  const markComplete = useCallback((globalDay: number) => {
    setProfile(prev => {
      const completed = prev.completedDays.includes(globalDay)
        ? prev.completedDays
        : [...prev.completedDays, globalDay].sort((a, b) => a - b);
      const next = completed.length > 0 ? Math.max(...completed) + 1 : globalDay + 1;
      const updated = { ...prev, completedDays: completed, currentDay: next, lastSeen: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const goToDay = useCallback((day: number) => {
    save({ ...profile, currentDay: day, lastSeen: new Date().toISOString() });
  }, [profile, save]);

  const isCompleted = useCallback((day: number) => profile.completedDays.includes(day), [profile]);

  return { isAuthenticated, profile, login, markComplete, goToDay, isCompleted };
}
