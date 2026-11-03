/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActivityCategory =
  | 'upsc_study'
  | 'answer_writing'
  | 'food_eating'
  | 'hygiene'
  | 'physical_health'
  | 'english_skills'
  | 'sleep_rest'
  | 'digital_distraction'
  | 'other_daily';

export type StudyMethod =
  | 'Standard Book Reading'
  | 'NCERT Reading'
  | 'Video Lecture'
  | 'Self Notes Making'
  | 'Active Revision'
  | 'Mock Test Practice'
  | 'PYQ Analysis'
  | 'Current Affairs Notes';

export type AnswerPaperType =
  | 'GS Paper 1'
  | 'GS Paper 2'
  | 'GS Paper 3'
  | 'GS Paper 4 (Ethics)'
  | 'Essay'
  | 'Optional Paper 1'
  | 'Optional Paper 2'
  | 'Daily Answer Practice';

export type ExerciseIntensity = 'Light' | 'Moderate' | 'Vigorous';

export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface ActivityEntry {
  id: string;
  category: ActivityCategory;
  subcategory: string; // e.g. "Indian Polity", "GS Paper 2", "Breakfast", "Brushing", "Running"
  title: string;
  startTime: number; // Unix epoch ms
  endTime: number; // Unix epoch ms
  durationMinutes: number;
  date: string; // YYYY-MM-DD in Asia/Kolkata
  isProductive: boolean;
  notes?: string;

  // Specific domain details
  upscDetails?: {
    studyMethod?: StudyMethod;
    chaptersCovered?: string;
    topicsCompleted?: string;
    selfAssessment?: number; // 1-5
    targetMinutes?: number;
  };

  answerWritingDetails?: {
    paperType?: AnswerPaperType;
    answersCount: number;
    timePerAnswerMinutes?: number;
    wordCount?: number;
    selfEvaluation?: number; // 1-5
    improvementNotes?: string;
  };

  foodDetails?: {
    mealType: string;
    description?: string;
    quantity?: string;
    isHealthy: boolean;
    waterGlasses?: number;
  };

  hygieneDetails?: {
    routineType: string;
    completedTasks?: string[];
  };

  healthDetails?: {
    activityType: string;
    intensity: ExerciseIntensity;
    repsOrDistance?: string;
  };

  englishDetails?: {
    skillType: string;
    materialUsed?: string;
  };

  sleepDetails?: {
    sleepType: string; // Night sleep, Afternoon nap, Power nap, Rest, Screen-free
    interruptionsCount?: number;
    sleepQuality: SleepQuality;
    bedTime?: string;
    wakeTime?: string;
  };

  distractionDetails?: {
    platform: string; // Instagram, YouTube, X, WhatsApp, etc.
    usageReason?: string;
    isProductive: boolean;
  };

  otherDetails?: {
    customCategory?: string;
  };
}

export interface ActiveTimerState {
  isActive: boolean;
  isPaused: boolean;
  category: ActivityCategory;
  subcategory: string;
  title: string;
  startTime: number; // epoch ms
  pausedAt?: number; // epoch ms
  accumulatedPausedMs: number;
  notes?: string;
  // Category-specific pre-configured properties
  upscDetails?: ActivityEntry['upscDetails'];
  answerWritingDetails?: ActivityEntry['answerWritingDetails'];
  foodDetails?: ActivityEntry['foodDetails'];
  healthDetails?: ActivityEntry['healthDetails'];
  englishDetails?: ActivityEntry['englishDetails'];
  sleepDetails?: ActivityEntry['sleepDetails'];
  distractionDetails?: ActivityEntry['distractionDetails'];
  isProductive: boolean;
}

export interface UserGoals {
  upscStudyMinutes: number; // e.g. 480 (8 hrs)
  answerWritingMinutes: number; // e.g. 60 (1 hr)
  englishMinutes: number; // e.g. 30 (30 mins)
  exerciseMinutes: number; // e.g. 45
  walkingMinutes: number; // e.g. 30
  meditationMinutes: number; // e.g. 15
  sleepMinutes: number; // e.g. 450 (7.5 hrs)
  maxDistractionMinutes: number; // e.g. 30
  maxJunkFoodPerWeek: number; // e.g. 1
  waterGlassesTarget: number; // e.g. 10
}

export interface CustomSubject {
  id: string;
  name: string;
  category: ActivityCategory;
  createdAt: number;
}

export type ViewTab =
  | 'dashboard'
  | 'timer'
  | 'timeline'
  | 'upsc'
  | 'answer_writing'
  | 'health'
  | 'food'
  | 'english'
  | 'distractions'
  | 'sleep'
  | 'calendar'
  | 'daily_report'
  | 'weekly_analytics'
  | 'monthly_analytics'
  | 'goals'
  | 'settings';
