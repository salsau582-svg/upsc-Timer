/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActivityEntry, ActiveTimerState, UserGoals, CustomSubject } from '../types';
import { formatISTTime, getISTDateString, istDateTimeToEpoch } from '../utils/time';

const DB_NAME = 'LifeTracker247_DB';
const DB_VERSION = 1;

export const DEFAULT_GOALS: UserGoals = {
  upscStudyMinutes: 480, // 8 hours
  answerWritingMinutes: 60, // 1 hour
  englishMinutes: 30, // 30 minutes
  exerciseMinutes: 45, // 45 minutes
  walkingMinutes: 30, // 30 minutes
  meditationMinutes: 15, // 15 minutes
  sleepMinutes: 450, // 7.5 hours
  maxDistractionMinutes: 30, // max 30 minutes
  maxJunkFoodPerWeek: 1, // max 1 time per week
  waterGlassesTarget: 10, // 10 glasses
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Activities Store
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('date', 'date', { unique: false });
        entryStore.createIndex('category', 'category', { unique: false });
        entryStore.createIndex('startTime', 'startTime', { unique: false });
      }

      // 2. Active Timer Store
      if (!db.objectStoreNames.contains('timer')) {
        db.createObjectStore('timer', { keyPath: 'key' });
      }

      // 3. User Goals Store
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'key' });
      }

      // 4. Custom Subjects Store
      if (!db.objectStoreNames.contains('custom_subjects')) {
        db.createObjectStore('custom_subjects', { keyPath: 'id' });
      }

      // 5. Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ====================== ACTIVITY ENTRIES ======================

export async function getAllEntries(): Promise<ActivityEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('entries', 'readonly');
    const store = transaction.objectStore('entries');
    const request = store.getAll();

    request.onsuccess = () => {
      const results: ActivityEntry[] = request.result || [];
      // Sort chronologically
      results.sort((a, b) => a.startTime - b.startTime);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getEntriesByDate(dateStr: string): Promise<ActivityEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('entries', 'readonly');
    const store = transaction.objectStore('entries');
    const index = store.index('date');
    const request = index.getAll(IDBKeyRange.only(dateStr));

    request.onsuccess = () => {
      const results: ActivityEntry[] = request.result || [];
      results.sort((a, b) => a.startTime - b.startTime);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveEntry(entry: ActivityEntry): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('entries', 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('entries', 'readwrite');
    const store = transaction.objectStore('entries');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ====================== TIMER STATE ======================

export async function getStoredTimerState(): Promise<ActiveTimerState | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('timer', 'readonly');
    const store = transaction.objectStore('timer');
    const request = store.get('current');

    request.onsuccess = () => {
      if (request.result && request.result.state) {
        resolve(request.result.state as ActiveTimerState);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveStoredTimerState(state: ActiveTimerState | null): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('timer', 'readwrite');
    const store = transaction.objectStore('timer');
    if (!state || !state.isActive) {
      const req = store.delete('current');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } else {
      const req = store.put({ key: 'current', state, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }
  });
}

// ====================== GOALS ======================

export async function getStoredGoals(): Promise<UserGoals> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('goals', 'readonly');
    const store = transaction.objectStore('goals');
    const request = store.get('user_goals');

    request.onsuccess = () => {
      if (request.result && request.result.goals) {
        resolve({ ...DEFAULT_GOALS, ...request.result.goals });
      } else {
        resolve(DEFAULT_GOALS);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveStoredGoals(goals: UserGoals): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('goals', 'readwrite');
    const store = transaction.objectStore('goals');
    const req = store.put({ key: 'user_goals', goals, updatedAt: Date.now() });

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ====================== CUSTOM SUBJECTS ======================

export async function getCustomSubjects(): Promise<CustomSubject[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('custom_subjects', 'readonly');
    const store = transaction.objectStore('custom_subjects');
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomSubject(subject: CustomSubject): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('custom_subjects', 'readwrite');
    const store = transaction.objectStore('custom_subjects');
    const req = store.put(subject);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCustomSubject(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('custom_subjects', 'readwrite');
    const store = transaction.objectStore('custom_subjects');
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ====================== EXPORT / IMPORT / BACKUP ======================

export async function exportAllDataJSON(): Promise<string> {
  const entries = await getAllEntries();
  const goals = await getStoredGoals();
  const customSubjects = await getCustomSubjects();

  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    timezone: 'Asia/Kolkata',
    entries,
    goals,
    customSubjects,
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function exportAllDataCSV(): Promise<string> {
  const entries = await getAllEntries();

  const headers = [
    'ID',
    'Date (IST)',
    'Start Time (IST)',
    'End Time (IST)',
    'Duration (Minutes)',
    'Category',
    'Subcategory',
    'Title',
    'Productive',
    'Notes',
    'UPSC Method',
    'UPSC Topics',
    'Self Assessment',
    'Answer Count',
    'Word Count',
    'Meal Healthy',
    'Sleep Quality',
    'Distraction Platform',
  ];

  const escapeCSV = (val: unknown) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = entries.map((e) => [
    escapeCSV(e.id),
    escapeCSV(e.date),
    escapeCSV(formatISTTime(e.startTime, true)),
    escapeCSV(formatISTTime(e.endTime, true)),
    escapeCSV(e.durationMinutes),
    escapeCSV(e.category),
    escapeCSV(e.subcategory),
    escapeCSV(e.title),
    escapeCSV(e.isProductive ? 'Yes' : 'No'),
    escapeCSV(e.notes || ''),
    escapeCSV(e.upscDetails?.studyMethod || ''),
    escapeCSV(e.upscDetails?.topicsCompleted || ''),
    escapeCSV(e.upscDetails?.selfAssessment || ''),
    escapeCSV(e.answerWritingDetails?.answersCount || ''),
    escapeCSV(e.answerWritingDetails?.wordCount || ''),
    escapeCSV(e.foodDetails ? (e.foodDetails.isHealthy ? 'Healthy' : 'Junk') : ''),
    escapeCSV(e.sleepDetails?.sleepQuality || ''),
    escapeCSV(e.distractionDetails?.platform || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export async function importDataFromJSON(jsonContent: string): Promise<{ count: number }> {
  const parsed = JSON.parse(jsonContent);
  if (!parsed || !Array.isArray(parsed.entries)) {
    throw new Error('Invalid backup file format: entries list missing.');
  }

  const db = await openDB();
  const tx = db.transaction(['entries', 'goals', 'custom_subjects'], 'readwrite');
  const entryStore = tx.objectStore('entries');
  const goalsStore = tx.objectStore('goals');
  const customStore = tx.objectStore('custom_subjects');

  for (const entry of parsed.entries) {
    if (entry.id && entry.startTime && entry.endTime) {
      entryStore.put(entry);
    }
  }

  if (parsed.goals) {
    goalsStore.put({ key: 'user_goals', goals: parsed.goals, updatedAt: Date.now() });
  }

  if (Array.isArray(parsed.customSubjects)) {
    for (const sub of parsed.customSubjects) {
      customStore.put(sub);
    }
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve({ count: parsed.entries.length });
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllDatabase(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(['entries', 'timer', 'goals', 'custom_subjects'], 'readwrite');
  tx.objectStore('entries').clear();
  tx.objectStore('timer').clear();
  tx.objectStore('goals').clear();
  tx.objectStore('custom_subjects').clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ====================== DEMO DATA GENERATOR ======================

export async function seedDemoUPSCData(): Promise<number> {
  const todayStr = getISTDateString();
  const [y, m, d] = todayStr.split('-').map(Number);

  // Generate for past 3 days and today
  const sampleDays: string[] = [];
  for (let offset = -3; offset <= 0; offset++) {
    const dt = new Date(Date.UTC(y, m - 1, d + offset, 12, 0, 0));
    const yr = dt.getUTCFullYear();
    const mo = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');
    sampleDays.push(`${yr}-${mo}-${day}`);
  }

  const entriesToSeed: ActivityEntry[] = [];

  for (const day of sampleDays) {
    // 1. Sleep: 23:00 to 06:00
    // Sleep start epoch (yesterday 23:00)
    const prevDayEpoch = istDateTimeToEpoch(day, '00:00') - 60 * 60 * 1000; // 23:00 previous night
    const wakeEpoch = istDateTimeToEpoch(day, '06:30');
    entriesToSeed.push({
      id: `demo-sleep-${day}`,
      category: 'sleep_rest',
      subcategory: 'Night sleep',
      title: 'Night Sleep (Solid & restful)',
      startTime: prevDayEpoch,
      endTime: wakeEpoch,
      durationMinutes: 450,
      date: day,
      isProductive: true,
      sleepDetails: {
        sleepType: 'Night sleep',
        sleepQuality: 5,
        interruptionsCount: 0,
      },
      notes: 'Woke up fresh, no midnight awakenings.',
    });

    // 2. Morning routine & water: 06:30 - 07:00
    entriesToSeed.push({
      id: `demo-hygiene-${day}`,
      category: 'hygiene',
      subcategory: 'Morning bathroom routine',
      title: 'Wake-up hydration & morning hygiene',
      startTime: istDateTimeToEpoch(day, '06:30'),
      endTime: istDateTimeToEpoch(day, '07:00'),
      durationMinutes: 30,
      date: day,
      isProductive: true,
      hygieneDetails: {
        routineType: 'Morning routine',
        completedTasks: ['Brushing', 'Face wash', '500ml water'],
      },
    });

    // 3. Physical Exercise: 07:00 - 07:45
    entriesToSeed.push({
      id: `demo-exercise-${day}`,
      category: 'physical_health',
      subcategory: 'Running',
      title: 'Outdoor morning run & stretching',
      startTime: istDateTimeToEpoch(day, '07:00'),
      endTime: istDateTimeToEpoch(day, '07:45'),
      durationMinutes: 45,
      date: day,
      isProductive: true,
      healthDetails: {
        activityType: 'Running',
        intensity: 'Moderate',
        repsOrDistance: '4.5 km',
      },
      notes: 'Good pacing, got morning sunlight.',
    });

    // 4. Breakfast: 07:45 - 08:15
    entriesToSeed.push({
      id: `demo-breakfast-${day}`,
      category: 'food_eating',
      subcategory: 'Breakfast',
      title: 'Oats, boiled eggs and green tea',
      startTime: istDateTimeToEpoch(day, '07:45'),
      endTime: istDateTimeToEpoch(day, '08:15'),
      durationMinutes: 30,
      date: day,
      isProductive: true,
      foodDetails: {
        mealType: 'Breakfast',
        description: 'Oats with nuts and 2 eggs',
        isHealthy: true,
        waterGlasses: 2,
      },
    });

    // 5. Newspaper & English Reading: 08:15 - 09:15
    entriesToSeed.push({
      id: `demo-english-${day}`,
      category: 'english_skills',
      subcategory: 'Newspaper reading in English',
      title: 'The Hindu Editorial & Op-Ed Analysis',
      startTime: istDateTimeToEpoch(day, '08:15'),
      endTime: istDateTimeToEpoch(day, '09:15'),
      durationMinutes: 60,
      date: day,
      isProductive: true,
      englishDetails: {
        skillType: 'Newspaper reading in English',
        materialUsed: 'The Hindu Editorials',
      },
      notes: 'Extracted 5 new vocabulary terms and noted GS-2 arguments.',
    });

    // 6. UPSC Study Session 1: Indian Polity: 09:30 - 12:30
    entriesToSeed.push({
      id: `demo-polity-${day}`,
      category: 'upsc_study',
      subcategory: 'Indian Polity',
      title: 'M. Laxmikanth: Parliament & Committee System',
      startTime: istDateTimeToEpoch(day, '09:30'),
      endTime: istDateTimeToEpoch(day, '12:30'),
      durationMinutes: 180,
      date: day,
      isProductive: true,
      upscDetails: {
        studyMethod: 'Standard Book Reading',
        chaptersCovered: 'Ch 22: Parliament',
        topicsCompleted: 'Speaker powers, Money bill vs Ordinary bill, PAC & Estimates committee',
        selfAssessment: 5,
        targetMinutes: 180,
      },
      notes: 'Very high focus session. High yield for Prelims and Mains.',
    });

    // 7. Lunch & Relaxation: 12:30 - 13:30
    entriesToSeed.push({
      id: `demo-lunch-${day}`,
      category: 'food_eating',
      subcategory: 'Lunch',
      title: 'Healthy dal, roti, sabzi and salad',
      startTime: istDateTimeToEpoch(day, '12:30'),
      endTime: istDateTimeToEpoch(day, '13:15'),
      durationMinutes: 45,
      date: day,
      isProductive: true,
      foodDetails: {
        mealType: 'Lunch',
        description: 'Dal, 3 rotis, mixed salad, curd',
        isHealthy: true,
        waterGlasses: 2,
      },
    });

    // 8. Afternoon Power Nap: 13:30 - 14:00
    entriesToSeed.push({
      id: `demo-nap-${day}`,
      category: 'sleep_rest',
      subcategory: 'Power nap',
      title: 'Afternoon reset nap',
      startTime: istDateTimeToEpoch(day, '13:30'),
      endTime: istDateTimeToEpoch(day, '14:00'),
      durationMinutes: 30,
      date: day,
      isProductive: true,
      sleepDetails: {
        sleepType: 'Power nap',
        sleepQuality: 4,
      },
    });

    // 9. Answer Writing Session: 14:15 - 15:45
    entriesToSeed.push({
      id: `demo-answers-${day}`,
      category: 'answer_writing',
      subcategory: 'GS Paper 2',
      title: 'GS-2 Daily Answer Practice: 4 Questions',
      startTime: istDateTimeToEpoch(day, '14:15'),
      endTime: istDateTimeToEpoch(day, '15:45'),
      durationMinutes: 90,
      date: day,
      isProductive: true,
      answerWritingDetails: {
        paperType: 'GS Paper 2',
        answersCount: 4,
        timePerAnswerMinutes: 18,
        wordCount: 1020,
        selfEvaluation: 4,
        improvementNotes: 'Include more Supreme Court judgments and Law Commission reports in intro.',
      },
    });

    // 10. UPSC Study Session 2: Modern History / Economy: 16:00 - 18:30
    entriesToSeed.push({
      id: `demo-study2-${day}`,
      category: 'upsc_study',
      subcategory: 'Modern History',
      title: 'Spectrum Modern History: Freedom Struggle 1920-1942',
      startTime: istDateTimeToEpoch(day, '16:00'),
      endTime: istDateTimeToEpoch(day, '18:30'),
      durationMinutes: 150,
      date: day,
      isProductive: true,
      upscDetails: {
        studyMethod: 'Active Revision',
        chaptersCovered: 'Non-Cooperation to Quit India',
        topicsCompleted: 'CDM, Round Table Conferences, Poona Pact, Cripps Mission',
        selfAssessment: 4,
        targetMinutes: 150,
      },
    });

    // 11. Distraction (YouTube / Insta): 18:45 - 19:20
    entriesToSeed.push({
      id: `demo-distract-${day}`,
      category: 'digital_distraction',
      subcategory: 'YouTube',
      title: 'Browsing random tech and shorts videos',
      startTime: istDateTimeToEpoch(day, '18:45'),
      endTime: istDateTimeToEpoch(day, '19:15'),
      durationMinutes: 30,
      date: day,
      isProductive: false,
      distractionDetails: {
        platform: 'YouTube',
        usageReason: 'Mindless scrolling after study',
        isProductive: false,
      },
      notes: 'Caught myself slipping into shorts; stopped after 30 mins.',
    });

    // 12. Walking in Nature & Meditation: 19:20 - 20:00
    entriesToSeed.push({
      id: `demo-walk-${day}`,
      category: 'physical_health',
      subcategory: 'Walking in nature',
      title: 'Evening walk & breathing practice',
      startTime: istDateTimeToEpoch(day, '19:20'),
      endTime: istDateTimeToEpoch(day, '20:00'),
      durationMinutes: 40,
      date: day,
      isProductive: true,
      healthDetails: {
        activityType: 'Walking in nature',
        intensity: 'Light',
        repsOrDistance: '3.0 km',
      },
    });

    // 13. Dinner: 20:15 - 20:50
    entriesToSeed.push({
      id: `demo-dinner-${day}`,
      category: 'food_eating',
      subcategory: 'Dinner',
      title: 'Light dinner with family',
      startTime: istDateTimeToEpoch(day, '20:15'),
      endTime: istDateTimeToEpoch(day, '20:50'),
      durationMinutes: 35,
      date: day,
      isProductive: true,
      foodDetails: {
        mealType: 'Dinner',
        description: 'Vegetable soup and paneer salad',
        isHealthy: true,
        waterGlasses: 2,
      },
    });

    // 14. Revision / PYQ: 21:00 - 22:30
    entriesToSeed.push({
      id: `demo-pyq-${day}`,
      category: 'upsc_study',
      subcategory: 'Previous Year Questions',
      title: 'PYQ 2018-2023 Polity & History Prelims analysis',
      startTime: istDateTimeToEpoch(day, '21:00'),
      endTime: istDateTimeToEpoch(day, '22:30'),
      durationMinutes: 90,
      date: day,
      isProductive: true,
      upscDetails: {
        studyMethod: 'PYQ Analysis',
        topicsCompleted: '50 questions solved, tracked trap options',
        selfAssessment: 5,
      },
    });
  }

  for (const item of entriesToSeed) {
    await saveEntry(item);
  }

  return entriesToSeed.length;
}
