/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/time';
import {
  Calendar,
  BarChart,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';

export const MonthlyAnalyticsView: React.FC = () => {
  const { entries } = useApp();

  // Extract available months from entries
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    for (const e of entries) {
      if (e.date) {
        monthsSet.add(e.date.slice(0, 7)); // YYYY-MM
      }
    }
    const currentMonth = new Date().toISOString().slice(0, 7);
    monthsSet.add(currentMonth);

    const sorted = Array.from(monthsSet).sort().reverse();
    return sorted;
  }, [entries]);

  const [primaryMonth, setPrimaryMonth] = useState<string>(availableMonths[0] || '2026-11');
  const [compareMonth, setCompareMonth] = useState<string>(availableMonths[1] || availableMonths[0] || '2026-10');

  // Compute stats for any given month YYYY-MM
  const computeMonthStats = (monthStr: string) => {
    let studyMinutes = 0;
    let answersMinutes = 0;
    let answersCount = 0;
    let englishMinutes = 0;
    let exerciseMinutes = 0;
    let sleepMinutes = 0;
    let sleepDays = 0;
    let distractionMinutes = 0;
    let junkFoodCount = 0;
    let productiveMinutes = 0;

    const subjectMap: Record<string, number> = {};

    const monthEntries = entries.filter((e) => e.date && e.date.startsWith(monthStr));

    for (const e of monthEntries) {
      const dur = e.durationMinutes;
      if (e.isProductive) productiveMinutes += dur;

      if (e.category === 'upsc_study') {
        studyMinutes += dur;
        subjectMap[e.subcategory] = (subjectMap[e.subcategory] || 0) + dur;
      }
      if (e.category === 'answer_writing') {
        answersMinutes += dur;
        answersCount += e.answerWritingDetails?.answersCount || 1;
      }
      if (e.category === 'english_skills') {
        englishMinutes += dur;
      }
      if (e.category === 'physical_health') {
        exerciseMinutes += dur;
      }
      if (e.category === 'sleep_rest') {
        if (e.subcategory === 'Night sleep' || e.subcategory === 'Afternoon nap' || e.subcategory === 'Power nap') {
          sleepMinutes += dur;
          sleepDays += 1;
        }
      }
      if (e.category === 'food_eating') {
        if (e.foodDetails && !e.foodDetails.isHealthy) {
          junkFoodCount += 1;
        }
      }
      if (e.category === 'digital_distraction' && !e.isProductive) {
        distractionMinutes += dur;
      }
    }

    const avgDailySleep = sleepDays > 0 ? Math.round(sleepMinutes / sleepDays) : 0;

    return {
      totalEntries: monthEntries.length,
      studyMinutes,
      answersMinutes,
      answersCount,
      englishMinutes,
      exerciseMinutes,
      sleepMinutes,
      avgDailySleep,
      distractionMinutes,
      junkFoodCount,
      productiveMinutes,
      subjectMap,
    };
  };

  const primaryStats = useMemo(() => computeMonthStats(primaryMonth), [entries, primaryMonth]);
  const compareStats = useMemo(() => computeMonthStats(compareMonth), [entries, compareMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Monthly & Yearly Progress Overview
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Analyze macro trends, track month-over-month UPSC study volume growth, and compare performance.
            </p>
          </div>

          {/* Month Selector & Compare Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-neutral-500">Month:</span>
              <select
                value={primaryMonth}
                onChange={(e) => setPrimaryMonth(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-bold"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-neutral-500">vs Compare:</span>
              <select
                value={compareMonth}
                onChange={(e) => setCompareMonth(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-bold"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Month Comparison Cards */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Comparative Analysis: {primaryMonth} vs {compareMonth}
          </h3>
          <span className="text-xs text-neutral-400">Delta indicators show progress</span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          {/* UPSC Study Hours */}
          <div className="p-4 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 font-semibold text-neutral-800 dark:text-neutral-200">
              Total UPSC Study Hours
            </div>
            <div className="col-span-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm tabular-nums">
              {formatDuration(primaryStats.studyMinutes)} ({primaryMonth})
            </div>
            <div className="col-span-4 font-mono text-neutral-500 text-sm tabular-nums">
              {formatDuration(compareStats.studyMinutes)} ({compareMonth})
            </div>
          </div>

          {/* Answer Writing */}
          <div className="p-4 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 font-semibold text-neutral-800 dark:text-neutral-200">
              Answer Writing Practice
            </div>
            <div className="col-span-4 font-mono font-bold text-purple-600 dark:text-purple-400 text-sm tabular-nums">
              {formatDuration(primaryStats.answersMinutes)} ({primaryStats.answersCount} answers)
            </div>
            <div className="col-span-4 font-mono text-neutral-500 text-sm tabular-nums">
              {formatDuration(compareStats.answersMinutes)} ({compareStats.answersCount} answers)
            </div>
          </div>

          {/* Productive Time */}
          <div className="p-4 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 font-semibold text-neutral-800 dark:text-neutral-200">
              Total Productive Hours
            </div>
            <div className="col-span-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
              {formatDuration(primaryStats.productiveMinutes)}
            </div>
            <div className="col-span-4 font-mono text-neutral-500 text-sm tabular-nums">
              {formatDuration(compareStats.productiveMinutes)}
            </div>
          </div>

          {/* Physical Exercise */}
          <div className="p-4 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 font-semibold text-neutral-800 dark:text-neutral-200">
              Physical Health & Exercise
            </div>
            <div className="col-span-4 font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm tabular-nums">
              {formatDuration(primaryStats.exerciseMinutes)}
            </div>
            <div className="col-span-4 font-mono text-neutral-500 text-sm tabular-nums">
              {formatDuration(compareStats.exerciseMinutes)}
            </div>
          </div>

          {/* English Skills */}
          <div className="p-4 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 font-semibold text-neutral-800 dark:text-neutral-200">
              English Language Practice
            </div>
            <div className="col-span-4 font-mono font-bold text-pink-600 dark:text-pink-400 text-sm tabular-nums">
              {formatDuration(primaryStats.englishMinutes)}
            </div>
            <div className="col-span-4 font-mono text-neutral-500 text-sm tabular-nums">
              {formatDuration(compareStats.englishMinutes)}
            </div>
          </div>

          {/* Digital Distractions */}
          <div className="p-4 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 font-semibold text-neutral-800 dark:text-neutral-200">
              Wasted Screen Time
            </div>
            <div className="col-span-4 font-mono font-bold text-rose-500 text-sm tabular-nums">
              {formatDuration(primaryStats.distractionMinutes)}
            </div>
            <div className="col-span-4 font-mono text-neutral-500 text-sm tabular-nums">
              {formatDuration(compareStats.distractionMinutes)}
            </div>
          </div>

          {/* Junk Food */}
          <div className="p-4 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 font-semibold text-neutral-800 dark:text-neutral-200">
              Junk Food Frequency
            </div>
            <div className="col-span-4 font-mono font-bold text-amber-600 dark:text-amber-400 text-sm tabular-nums">
              {primaryStats.junkFoodCount} times
            </div>
            <div className="col-span-4 font-mono text-neutral-500 text-sm tabular-nums">
              {compareStats.junkFoodCount} times
            </div>
          </div>
        </div>
      </div>

      {/* Primary Month Subject Hours Breakdown */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
          Cumulative Subject Coverage in {primaryMonth}
        </h3>

        {Object.keys(primaryStats.subjectMap).length === 0 ? (
          <p className="text-xs text-neutral-500">No study logs in {primaryMonth}.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(primaryStats.subjectMap)
              .sort((a, b) => b[1] - a[1])
              .map(([subject, mins]) => (
                <div
                  key={subject}
                  className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                >
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block truncate">
                    {subject}
                  </span>
                  <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400 mt-1 block tabular-nums">
                    {formatDuration(mins)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
