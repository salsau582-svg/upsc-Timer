/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserGoals } from '../types';
import { formatDuration } from '../utils/time';
import {
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';

export const GoalsHabitsView: React.FC = () => {
  const { goals, saveGoals, todayEntries } = useApp();

  const [formGoals, setFormGoals] = useState<UserGoals>(goals);
  const [isSaved, setIsSaved] = useState(false);

  // Today actual performance
  let actualStudy = 0;
  let actualAnswers = 0;
  let actualEnglish = 0;
  let actualExercise = 0;
  let actualWalking = 0;
  let actualMeditation = 0;
  let actualSleep = 0;
  let actualWasted = 0;
  let actualJunk = 0;

  for (const e of todayEntries) {
    if (e.category === 'upsc_study') actualStudy += e.durationMinutes;
    if (e.category === 'answer_writing') actualAnswers += e.durationMinutes;
    if (e.category === 'english_skills') actualEnglish += e.durationMinutes;
    if (e.category === 'physical_health') {
      actualExercise += e.durationMinutes;
      if (e.subcategory === 'Walking' || e.subcategory === 'Walking in nature') {
        actualWalking += e.durationMinutes;
      }
      if (e.subcategory === 'Meditation' || e.subcategory === 'Breathing exercises') {
        actualMeditation += e.durationMinutes;
      }
    }
    if (e.category === 'sleep_rest' && (e.subcategory === 'Night sleep' || e.subcategory === 'Afternoon nap' || e.subcategory === 'Power nap')) {
      actualSleep += e.durationMinutes;
    }
    if (e.category === 'digital_distraction' && !e.isProductive) {
      actualWasted += e.durationMinutes;
    }
    if (e.category === 'food_eating' && e.foodDetails && !e.foodDetails.isHealthy) {
      actualJunk += 1;
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveGoals(formGoals);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults: UserGoals = {
      upscStudyMinutes: 480,
      answerWritingMinutes: 60,
      englishMinutes: 30,
      exerciseMinutes: 45,
      walkingMinutes: 30,
      meditationMinutes: 15,
      sleepMinutes: 450,
      maxDistractionMinutes: 30,
      maxJunkFoodPerWeek: 1,
      waterGlassesTarget: 10,
    };
    setFormGoals(defaults);
  };

  const targetsList = [
    {
      label: 'UPSC Study Target',
      key: 'upscStudyMinutes' as const,
      actual: actualStudy,
      target: formGoals.upscStudyMinutes,
      unit: 'minutes',
      color: 'bg-blue-600',
      description: 'Dedicated core syllabus study and active recall (Default: 8h = 480m)',
    },
    {
      label: 'Answer Writing Practice',
      key: 'answerWritingMinutes' as const,
      actual: actualAnswers,
      target: formGoals.answerWritingMinutes,
      unit: 'minutes',
      color: 'bg-purple-600',
      description: 'Daily GS and Essay answer writing (Default: 1h = 60m)',
    },
    {
      label: 'English Skills & Newspaper',
      key: 'englishMinutes' as const,
      actual: actualEnglish,
      target: formGoals.englishMinutes,
      unit: 'minutes',
      color: 'bg-pink-600',
      description: 'Reading editorials and vocabulary building (Default: 30m)',
    },
    {
      label: 'Physical Exercise & Gym',
      key: 'exerciseMinutes' as const,
      actual: actualExercise,
      target: formGoals.exerciseMinutes,
      unit: 'minutes',
      color: 'bg-emerald-600',
      description: 'Cardio, strength, running or yoga (Default: 45m)',
    },
    {
      label: 'Walking in Nature / Outdoors',
      key: 'walkingMinutes' as const,
      actual: actualWalking,
      target: formGoals.walkingMinutes,
      unit: 'minutes',
      color: 'bg-teal-600',
      description: 'Daily outdoor sunlight and walking (Default: 30m)',
    },
    {
      label: 'Mindfulness & Meditation',
      key: 'meditationMinutes' as const,
      actual: actualMeditation,
      target: formGoals.meditationMinutes,
      unit: 'minutes',
      color: 'bg-cyan-600',
      description: 'Breathing exercises and stress reduction (Default: 15m)',
    },
    {
      label: 'Night Sleep & Recovery',
      key: 'sleepMinutes' as const,
      actual: actualSleep,
      target: formGoals.sleepMinutes,
      unit: 'minutes',
      color: 'bg-indigo-600',
      description: 'Optimal restorative sleep (Default: 7.5h = 450m)',
    },
    {
      label: 'Max Digital Distraction / Screen Waste',
      key: 'maxDistractionMinutes' as const,
      actual: actualWasted,
      target: formGoals.maxDistractionMinutes,
      unit: 'minutes',
      isLimit: true,
      color: 'bg-rose-500',
      description: 'Hard daily cap on Instagram, YouTube shorts, and feeds (Default: 30m)',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Habits & Target Management
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Customize your rigorous daily benchmarks. Real-time progress bars indicate whether targets are met.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Progress Checklist */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Today's Target Progress & Achievement Status
          </h3>
          <span className="text-xs text-neutral-400">Live updated against recorded entries</span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 p-2">
          {targetsList.map((item) => {
            const isLimit = (item as any).isLimit;
            const pct = Math.min(100, Math.round((item.actual / Math.max(1, item.target)) * 100));
            const isAchieved = isLimit ? item.actual <= item.target : item.actual >= item.target;

            return (
              <div key={item.key} className="p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {item.label}
                    </span>
                    <span className="text-neutral-400 text-[11px] block sm:inline sm:ml-2">
                      ({item.description})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {formatDuration(item.actual)}
                      </span>{' '}
                      / {formatDuration(item.target)}
                    </span>
                    {isAchieved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Achieved</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-500">
                        {pct}% complete
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLimit
                        ? item.actual > item.target
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                        : item.color
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Customization Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Edit Daily Targets (in minutes)
            </h3>
            <p className="text-xs text-neutral-500">
              Update any quota to fit your current preparation stage (e.g. Mains vs Prelims).
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Saved!' : 'Save Targets'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              UPSC Study Target (minutes)
            </label>
            <input
              type="number"
              min="60"
              step="30"
              value={formGoals.upscStudyMinutes}
              onChange={(e) => setFormGoals({ ...formGoals, upscStudyMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              = {Math.round((formGoals.upscStudyMinutes / 60) * 10) / 10} hours
            </span>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Answer Writing Target (minutes)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={formGoals.answerWritingMinutes}
              onChange={(e) => setFormGoals({ ...formGoals, answerWritingMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              = {Math.round((formGoals.answerWritingMinutes / 60) * 10) / 10} hours
            </span>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              English Practice Target (minutes)
            </label>
            <input
              type="number"
              min="10"
              step="10"
              value={formGoals.englishMinutes}
              onChange={(e) => setFormGoals({ ...formGoals, englishMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Physical Exercise Target (minutes)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={formGoals.exerciseMinutes}
              onChange={(e) => setFormGoals({ ...formGoals, exerciseMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Sleep Target (minutes)
            </label>
            <input
              type="number"
              min="300"
              step="30"
              value={formGoals.sleepMinutes}
              onChange={(e) => setFormGoals({ ...formGoals, sleepMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
            />
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              = {Math.round((formGoals.sleepMinutes / 60) * 10) / 10} hours
            </span>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Max Distraction Limit (minutes)
            </label>
            <input
              type="number"
              min="0"
              step="15"
              value={formGoals.maxDistractionMinutes}
              onChange={(e) => setFormGoals({ ...formGoals, maxDistractionMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
