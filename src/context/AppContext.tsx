/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  ActivityEntry,
  ActiveTimerState,
  ActivityCategory,
  UserGoals,
  CustomSubject,
  ViewTab,
} from '../types';
import {
  getAllEntries,
  saveEntry,
  deleteEntry,
  getStoredTimerState,
  saveStoredTimerState,
  getStoredGoals,
  saveStoredGoals,
  getCustomSubjects,
  saveCustomSubject,
  deleteCustomSubject,
  DEFAULT_GOALS,
} from '../services/db';
import {
  formatISTTime,
  getISTDateString,
  doIntervalsOverlap,
} from '../utils/time';
import { CATEGORIES_CONFIG } from '../utils/categories';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  // Navigation
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;

  // Real-time IST clock
  currentISTTime: string;
  todayDateStr: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Data
  entries: ActivityEntry[];
  todayEntries: ActivityEntry[];
  selectedDateEntries: ActivityEntry[];
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Timer
  activeTimer: ActiveTimerState | null;
  timerElapsedMs: number;
  startTimer: (
    category: ActivityCategory,
    subcategory: string,
    title: string,
    details?: Partial<ActiveTimerState>
  ) => boolean;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (customNotes?: string) => Promise<ActivityEntry | null>;
  discardTimer: () => void;

  // Entry Actions
  addManualEntry: (entry: Omit<ActivityEntry, 'id'>) => Promise<{ success: boolean; error?: string; overlapWarning?: boolean }>;
  editEntry: (entry: ActivityEntry) => Promise<void>;
  deleteEntryById: (id: string) => Promise<void>;

  // Goals
  goals: UserGoals;
  saveGoals: (newGoals: UserGoals) => Promise<void>;

  // Custom Subjects
  customSubjects: CustomSubject[];
  addCustomSubjectName: (name: string, category: ActivityCategory) => Promise<void>;
  deleteCustomSubjectById: (id: string) => Promise<void>;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [customSubjects, setCustomSubjects] = useState<CustomSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Time states
  const [currentISTTime, setCurrentISTTime] = useState<string>(formatISTTime());
  const [todayDateStr, setTodayDateStr] = useState<string>(getISTDateString());
  const [selectedDate, setSelectedDate] = useState<string>(getISTDateString());

  // Active Timer
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);
  const [timerElapsedMs, setTimerElapsedMs] = useState<number>(0);

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lifetracker_theme') as 'dark' | 'light') || 'dark';
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme synchronization
  useEffect(() => {
    localStorage.setItem('lifetracker_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // 1-second clock loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentISTTime(formatISTTime());
      const nowStr = getISTDateString();
      if (nowStr !== todayDateStr) {
        setTodayDateStr(nowStr);
      }

      // Compute active timer elapsed
      if (activeTimer && activeTimer.isActive) {
        if (activeTimer.isPaused) {
          const pausedTime = activeTimer.pausedAt || Date.now();
          const elapsed = pausedTime - activeTimer.startTime - activeTimer.accumulatedPausedMs;
          setTimerElapsedMs(Math.max(0, elapsed));
        } else {
          const elapsed = Date.now() - activeTimer.startTime - activeTimer.accumulatedPausedMs;
          setTimerElapsedMs(Math.max(0, elapsed));
        }
      } else {
        setTimerElapsedMs(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, todayDateStr]);

  // Initial Data Load
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allEntries, storedTimer, storedGoals, subjects] = await Promise.all([
        getAllEntries(),
        getStoredTimerState(),
        getStoredGoals(),
        getCustomSubjects(),
      ]);

      setEntries(allEntries);
      setGoals(storedGoals);
      setCustomSubjects(subjects);

      if (storedTimer && storedTimer.isActive) {
        setActiveTimer(storedTimer);
        const elapsed = storedTimer.isPaused
          ? (storedTimer.pausedAt || Date.now()) - storedTimer.startTime - storedTimer.accumulatedPausedMs
          : Date.now() - storedTimer.startTime - storedTimer.accumulatedPausedMs;
        setTimerElapsedMs(Math.max(0, elapsed));
      }
    } catch (err) {
      console.error('Error loading data from IndexedDB:', err);
      addToast('Error accessing offline storage.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Filter entries for today and selectedDate
  const todayEntries = useMemo(() => {
    return entries.filter((e) => e.date === todayDateStr);
  }, [entries, todayDateStr]);

  const selectedDateEntries = useMemo(() => {
    return entries.filter((e) => e.date === selectedDate);
  }, [entries, selectedDate]);

  // Timer Actions
  const startTimer = useCallback(
    (
      category: ActivityCategory,
      subcategory: string,
      title: string,
      details: Partial<ActiveTimerState> = {}
    ): boolean => {
      if (activeTimer && activeTimer.isActive) {
        addToast(
          `Another activity ("${activeTimer.title || activeTimer.subcategory}") is already running. Please pause or stop it first.`,
          'warning'
        );
        return false;
      }

      const meta = CATEGORIES_CONFIG[category];
      const isProductive = details.isProductive !== undefined ? details.isProductive : meta.defaultProductive;

      const newTimer: ActiveTimerState = {
        isActive: true,
        isPaused: false,
        category,
        subcategory,
        title: title.trim() || subcategory,
        startTime: Date.now(),
        accumulatedPausedMs: 0,
        isProductive,
        notes: details.notes || '',
        upscDetails: details.upscDetails,
        answerWritingDetails: details.answerWritingDetails,
        foodDetails: details.foodDetails,
        healthDetails: details.healthDetails,
        englishDetails: details.englishDetails,
        sleepDetails: details.sleepDetails,
        distractionDetails: details.distractionDetails,
      };

      setActiveTimer(newTimer);
      setTimerElapsedMs(0);
      saveStoredTimerState(newTimer);
      addToast(`Timer started: ${newTimer.title}`, 'success');
      return true;
    },
    [activeTimer, addToast]
  );

  const pauseTimer = useCallback(() => {
    if (!activeTimer || !activeTimer.isActive || activeTimer.isPaused) return;

    const updated: ActiveTimerState = {
      ...activeTimer,
      isPaused: true,
      pausedAt: Date.now(),
    };

    setActiveTimer(updated);
    saveStoredTimerState(updated);
    addToast('Timer paused', 'info');
  }, [activeTimer, addToast]);

  const resumeTimer = useCallback(() => {
    if (!activeTimer || !activeTimer.isActive || !activeTimer.isPaused) return;

    const pauseDuration = activeTimer.pausedAt ? Date.now() - activeTimer.pausedAt : 0;
    const updated: ActiveTimerState = {
      ...activeTimer,
      isPaused: false,
      pausedAt: undefined,
      accumulatedPausedMs: activeTimer.accumulatedPausedMs + pauseDuration,
    };

    setActiveTimer(updated);
    saveStoredTimerState(updated);
    addToast('Timer resumed', 'info');
  }, [activeTimer, addToast]);

  const stopTimer = useCallback(
    async (customNotes?: string): Promise<ActivityEntry | null> => {
      if (!activeTimer || !activeTimer.isActive) return null;

      const endTime = Date.now();
      const effectivePause = activeTimer.isPaused && activeTimer.pausedAt
        ? activeTimer.accumulatedPausedMs + (endTime - activeTimer.pausedAt)
        : activeTimer.accumulatedPausedMs;

      const rawDurationMinutes = (endTime - activeTimer.startTime - effectivePause) / (1000 * 60);
      const durationMinutes = Math.max(1, Math.round(rawDurationMinutes));

      const entryDate = getISTDateString(activeTimer.startTime);

      const newEntry: ActivityEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        category: activeTimer.category,
        subcategory: activeTimer.subcategory,
        title: activeTimer.title,
        startTime: activeTimer.startTime,
        endTime,
        durationMinutes,
        date: entryDate,
        isProductive: activeTimer.isProductive,
        notes: customNotes !== undefined ? customNotes : activeTimer.notes,
        upscDetails: activeTimer.upscDetails,
        answerWritingDetails: activeTimer.answerWritingDetails,
        foodDetails: activeTimer.foodDetails,
        healthDetails: activeTimer.healthDetails,
        englishDetails: activeTimer.englishDetails,
        sleepDetails: activeTimer.sleepDetails,
        distractionDetails: activeTimer.distractionDetails,
      };

      // Check overlap with existing entries
      const hasOverlap = entries.some(
        (e) => e.date === entryDate && doIntervalsOverlap(newEntry.startTime, newEntry.endTime, e.startTime, e.endTime)
      );

      if (hasOverlap) {
        addToast('Warning: This activity overlaps with another recorded entry.', 'warning');
      }

      await saveEntry(newEntry);
      await saveStoredTimerState(null);

      setActiveTimer(null);
      setTimerElapsedMs(0);
      setEntries((prev) => [...prev, newEntry].sort((a, b) => a.startTime - b.startTime));

      addToast(`Activity saved: ${newEntry.title} (${durationMinutes}m)`, 'success');
      return newEntry;
    },
    [activeTimer, entries, addToast]
  );

  const discardTimer = useCallback(() => {
    setActiveTimer(null);
    setTimerElapsedMs(0);
    saveStoredTimerState(null);
    addToast('Timer discarded without saving.', 'info');
  }, [addToast]);

  // Entry CRUD
  const addManualEntry = useCallback(
    async (entryData: Omit<ActivityEntry, 'id'>) => {
      if (entryData.endTime <= entryData.startTime) {
        return { success: false, error: 'End time must be strictly after start time.' };
      }

      const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const entry: ActivityEntry = {
        ...entryData,
        id,
      };

      // Check overlap
      const hasOverlap = entries.some(
        (e) => e.date === entry.date && doIntervalsOverlap(entry.startTime, entry.endTime, e.startTime, e.endTime)
      );

      await saveEntry(entry);
      setEntries((prev) => [...prev, entry].sort((a, b) => a.startTime - b.startTime));

      addToast(
        hasOverlap
          ? `Saved with overlap: ${entry.title}`
          : `Added entry: ${entry.title}`,
        hasOverlap ? 'warning' : 'success'
      );

      return { success: true, overlapWarning: hasOverlap };
    },
    [entries, addToast]
  );

  const editEntry = useCallback(
    async (updatedEntry: ActivityEntry) => {
      await saveEntry(updatedEntry);
      setEntries((prev) =>
        prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)).sort((a, b) => a.startTime - b.startTime)
      );
      addToast(`Updated entry: ${updatedEntry.title}`, 'success');
    },
    [addToast]
  );

  const deleteEntryById = useCallback(
    async (id: string) => {
      await deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      addToast('Entry deleted successfully.', 'info');
    },
    [addToast]
  );

  // Goals
  const saveGoals = useCallback(
    async (newGoals: UserGoals) => {
      await saveStoredGoals(newGoals);
      setGoals(newGoals);
      addToast('Goals updated successfully.', 'success');
    },
    [addToast]
  );

  // Custom Subjects
  const addCustomSubjectName = useCallback(
    async (name: string, category: ActivityCategory) => {
      const clean = name.trim();
      if (!clean) return;
      const subject: CustomSubject = {
        id: `custom-sub-${Date.now()}`,
        name: clean,
        category,
        createdAt: Date.now(),
      };
      await saveCustomSubject(subject);
      setCustomSubjects((prev) => [...prev, subject]);
      addToast(`Added custom topic: "${clean}"`, 'success');
    },
    [addToast]
  );

  const deleteCustomSubjectById = useCallback(
    async (id: string) => {
      await deleteCustomSubject(id);
      setCustomSubjects((prev) => prev.filter((s) => s.id !== id));
      addToast('Custom topic removed.', 'info');
    },
    [addToast]
  );

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentISTTime,
        todayDateStr,
        selectedDate,
        setSelectedDate,
        entries,
        todayEntries,
        selectedDateEntries,
        isLoading,
        refreshData,
        activeTimer,
        timerElapsedMs,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        discardTimer,
        addManualEntry,
        editEntry,
        deleteEntryById,
        goals,
        saveGoals,
        customSubjects,
        addCustomSubjectName,
        deleteCustomSubjectById,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
