/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatDuration,
  getWeekDaysForDate,
  getDurationForDate,
  formatISTHumanDate,
} from '../utils/time';
import { UPSC_SUBJECTS, CATEGORIES_CONFIG } from '../utils/categories';
import {
  PieChart,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const WeeklyAnalyticsView: React.FC = () => {
  const { entries, selectedDate, setSelectedDate, goals } = useApp();

  // Selected week's 7 days (Monday to Sunday)
  const weekDays = useMemo(() => {
    return getWeekDaysForDate(selectedDate);
  }, [selectedDate]);

  const changeWeekBy = (weeks: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d + weeks * 7, 12, 0, 0));
    const yr = dateObj.getUTCFullYear();
    const mo = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const dt = String(dateObj.getUTCDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dt}`);
  };

  // Day names for the 7 days
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Aggregate weekly data
  const weekData = useMemo(() => {
    let totalStudyMinutes = 0;
    let totalAnswersMinutes = 0;
    let totalExerciseMinutes = 0;
    let totalSleepMinutes = 0;
    let totalDistractionMinutes = 0;
    let totalJunkCount = 0;
    let totalOutdoorMinutes = 0;
    let totalEnglishMinutes = 0;
    let totalRestMinutes = 0;
    let totalProductiveMinutes = 0;

    // Daily arrays (7 values)
    const dailyStudy = [0, 0, 0, 0, 0, 0, 0];
    const dailyProductive = [0, 0, 0, 0, 0, 0, 0];
    const dailyWasted = [0, 0, 0, 0, 0, 0, 0];
    const dailySleep = [0, 0, 0, 0, 0, 0, 0];
    const dailyExercise = [0, 0, 0, 0, 0, 0, 0];

    const subjectBreakdown: Record<string, number> = {};
    const distractionBreakdown: Record<string, number> = {};
    const categoryTotals: Record<string, number> = {};

    for (let i = 0; i < 7; i++) {
      const dayStr = weekDays[i];

      for (const e of entries) {
        const dur = getDurationForDate(e.startTime, e.endTime, dayStr);
        if (dur <= 0) continue;

        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + dur;

        if (e.isProductive) {
          totalProductiveMinutes += dur;
          dailyProductive[i] += dur;
        }

        if (e.category === 'upsc_study') {
          totalStudyMinutes += dur;
          dailyStudy[i] += dur;
          subjectBreakdown[e.subcategory] = (subjectBreakdown[e.subcategory] || 0) + dur;
        }

        if (e.category === 'answer_writing') {
          totalAnswersMinutes += dur;
        }

        if (e.category === 'english_skills') {
          totalEnglishMinutes += dur;
        }

        if (e.category === 'physical_health') {
          totalExerciseMinutes += dur;
          dailyExercise[i] += dur;
          if (
            e.subcategory === 'Touch grass/outdoor time' ||
            e.subcategory === 'Walking in nature' ||
            e.subcategory === 'Running' ||
            e.subcategory === 'Sunlight exposure' ||
            e.subcategory === 'Walking'
          ) {
            totalOutdoorMinutes += dur;
          }
        }

        if (e.category === 'sleep_rest') {
          if (e.subcategory === 'Night sleep' || e.subcategory === 'Afternoon nap' || e.subcategory === 'Power nap') {
            totalSleepMinutes += dur;
            dailySleep[i] += dur;
          } else {
            totalRestMinutes += dur;
          }
        }

        if (e.category === 'food_eating') {
          if (e.foodDetails && !e.foodDetails.isHealthy) {
            totalJunkCount += 1;
          }
        }

        if (e.category === 'digital_distraction') {
          if (!e.isProductive) {
            totalDistractionMinutes += dur;
            dailyWasted[i] += dur;
            distractionBreakdown[e.subcategory] = (distractionBreakdown[e.subcategory] || 0) + dur;
          }
        }
      }
    }

    const totalWeekAvailable = 7 * 1440;
    const totalUntrackedMinutes = Math.max(0, totalWeekAvailable - (totalProductiveMinutes + totalDistractionMinutes));

    // Insights
    let mostProductiveDayIndex = 0;
    let leastProductiveDayIndex = 0;
    let maxProd = -1;
    let minProd = 999999;

    for (let i = 0; i < 7; i++) {
      if (dailyProductive[i] > maxProd) {
        maxProd = dailyProductive[i];
        mostProductiveDayIndex = i;
      }
      if (dailyProductive[i] < minProd) {
        minProd = dailyProductive[i];
        leastProductiveDayIndex = i;
      }
    }

    // Neglected subjects: Which UPSC subjects got 0 or lowest minutes
    const zeroAttentionSubjects = UPSC_SUBJECTS.filter((sub) => !subjectBreakdown[sub] || subjectBreakdown[sub] === 0);

    // Sleep consistency check: standard deviation of daily sleep
    const validSleepDays = dailySleep.filter((s) => s > 0);
    const avgSleep = validSleepDays.length > 0 ? validSleepDays.reduce((a, b) => a + b, 0) / validSleepDays.length : 0;
    const isSleepConsistent = validSleepDays.length >= 5 && validSleepDays.every((s) => Math.abs(s - avgSleep) <= 90);

    // Exercise consistency
    const exerciseDaysCount = dailyExercise.filter((ex) => ex >= 30).length;
    const isExerciseConsistent = exerciseDaysCount >= 4;

    return {
      totalStudyMinutes,
      totalAnswersMinutes,
      totalExerciseMinutes,
      totalSleepMinutes,
      totalDistractionMinutes,
      totalJunkCount,
      totalOutdoorMinutes,
      totalEnglishMinutes,
      totalRestMinutes,
      totalProductiveMinutes,
      totalUntrackedMinutes,
      dailyStudy,
      dailyProductive,
      dailyWasted,
      dailySleep,
      dailyExercise,
      subjectBreakdown,
      distractionBreakdown,
      categoryTotals,
      mostProductiveDay: dayLabels[mostProductiveDayIndex],
      mostProductiveMins: maxProd,
      leastProductiveDay: dayLabels[leastProductiveDayIndex],
      leastProductiveMins: minProd,
      zeroAttentionSubjects,
      isSleepConsistent,
      isExerciseConsistent,
      exerciseDaysCount,
    };
  }, [entries, weekDays]);

  // Scaled max for bar chart
  const maxDailyStudyHours = Math.max(10, Math.ceil(Math.max(...weekData.dailyStudy) / 60));

  return (
    <div className="space-y-6">
      {/* Week Header & Range Navigator */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Weekly Performance Audit (Mon &ndash; Sun)
          </span>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {weekDays[0]} &rarr; {weekDays[6]}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeWeekBy(-1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev Week</span>
          </button>
          <button
            onClick={() => changeWeekBy(1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            <span>Next Week</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 10 Weekly Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Study</span>
          <span className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block tabular-nums">
            {formatDuration(weekData.totalStudyMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Avg: {formatDuration(weekData.totalStudyMinutes / 7)} / day
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Answer Writing</span>
          <span className="font-mono text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 block tabular-nums">
            {formatDuration(weekData.totalAnswersMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            GS & Essay practice
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Physical Health</span>
          <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
            {formatDuration(weekData.totalExerciseMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            {weekData.exerciseDaysCount} of 7 active days
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Outdoor / Touch Grass</span>
          <span className="font-mono text-xl font-bold text-amber-500 mt-1 block tabular-nums">
            {formatDuration(weekData.totalOutdoorMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Sunlight & fresh air
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Sleep</span>
          <span className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block tabular-nums">
            {formatDuration(weekData.totalSleepMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Avg: {formatDuration(weekData.totalSleepMinutes / 7)} / night
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">English Practice</span>
          <span className="font-mono text-xl font-bold text-pink-600 dark:text-pink-400 mt-1 block tabular-nums">
            {formatDuration(weekData.totalEnglishMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Target: 3.5h / week
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Rest & Relaxation</span>
          <span className="font-mono text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1 block tabular-nums">
            {formatDuration(weekData.totalRestMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Mental recovery
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Wasted Distraction</span>
          <span className="font-mono text-xl font-bold text-rose-500 mt-1 block tabular-nums">
            {formatDuration(weekData.totalDistractionMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Social media leakage
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Junk Food Eaten</span>
          <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block tabular-nums">
            {weekData.totalJunkCount} times
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Max limit: {goals.maxJunkFoodPerWeek || 1} / week
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Untracked Gaps</span>
          <span className="font-mono text-xl font-bold text-neutral-400 mt-1 block tabular-nums">
            {formatDuration(weekData.totalUntrackedMinutes)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Unlogged hours
          </span>
        </div>
      </div>

      {/* SVG Charts Row 1: Daily Study Comparison & Productive vs Wasted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Study Comparison Bar Chart */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Daily Study Hours (Mon &ndash; Sun)
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">
              Target: 8h/day
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-neutral-200 dark:border-neutral-800">
            {dayLabels.map((label, idx) => {
              const minutes = weekData.dailyStudy[idx];
              const hours = Math.round((minutes / 60) * 10) / 10;
              const heightPercent = Math.min(100, Math.round((hours / maxDailyStudyHours) * 100));

              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {hours}h
                  </span>
                  <div className="w-full max-w-[36px] bg-neutral-100 dark:bg-neutral-800 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full transition-all duration-500 rounded-t-md ${
                        hours >= 8 ? 'bg-blue-600' : hours >= 5 ? 'bg-blue-400' : 'bg-neutral-400 dark:bg-neutral-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productive vs Wasted Time Chart */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Productive vs Wasted (Hours)
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Productive
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Wasted
              </span>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-neutral-200 dark:border-neutral-800">
            {dayLabels.map((label, idx) => {
              const prodMins = weekData.dailyProductive[idx];
              const wasteMins = weekData.dailyWasted[idx];
              const prodHours = Math.round((prodMins / 60) * 10) / 10;
              const wasteHours = Math.round((wasteMins / 60) * 10) / 10;

              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Productive bar */}
                    <div
                      className="w-1/2 max-w-[16px] bg-emerald-500 rounded-t transition-all duration-500"
                      style={{ height: `${Math.min(100, (prodHours / 14) * 100)}%` }}
                      title={`${label} Productive: ${prodHours}h`}
                    />
                    {/* Wasted bar */}
                    <div
                      className="w-1/2 max-w-[16px] bg-rose-500 rounded-t transition-all duration-500"
                      style={{ height: `${Math.min(100, (wasteHours / 6) * 100)}%` }}
                      title={`${label} Wasted: ${wasteHours}h`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SVG Charts Row 2: Sleep and Exercise Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sleep duration by day */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Sleep Duration by Day (Hours)
            </h3>
            <span className="text-[11px] text-neutral-500">
              Consistency: {weekData.isSleepConsistent ? 'Consistent ✓' : 'Fluctuating'}
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-neutral-200 dark:border-neutral-800">
            {dayLabels.map((label, idx) => {
              const sleepHrs = Math.round((weekData.dailySleep[idx] / 60) * 10) / 10;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-indigo-500 font-bold tabular-nums">
                    {sleepHrs}h
                  </span>
                  <div
                    className="w-full max-w-[32px] bg-indigo-500/80 rounded-t transition-all duration-500"
                    style={{ height: `${Math.min(100, (sleepHrs / 10) * 100)}%` }}
                  />
                  <span className="text-xs font-semibold text-neutral-500">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject-wise study distribution */}
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Subject Study Distribution
            </h3>
            <span className="text-[11px] text-neutral-500">
              {Object.keys(weekData.subjectBreakdown).length} subjects studied
            </span>
          </div>

          {Object.keys(weekData.subjectBreakdown).length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No study data recorded for this week yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(weekData.subjectBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([sub, mins]) => {
                  const pct = Math.round((mins / Math.max(1, weekData.totalStudyMinutes)) * 100);
                  return (
                    <div key={sub} className="text-xs">
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-neutral-800 dark:text-neutral-200 truncate pr-2">{sub}</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                          {formatDuration(mins)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Qualitative Strategic Takeaways */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
          Weekly Analytical Diagnostic Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
              Most Productive Day
            </span>
            <p className="text-neutral-500 mt-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{weekData.mostProductiveDay}</span> with {formatDuration(weekData.mostProductiveMins)} of focused output.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
              Least Productive Day
            </span>
            <p className="text-neutral-500 mt-1">
              <span className="font-semibold text-rose-500">{weekData.leastProductiveDay}</span> ({formatDuration(weekData.leastProductiveMins)}). Analyze interruptions on this day.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
              Neglected Subjects
            </span>
            <p className="text-neutral-500 mt-1">
              {weekData.zeroAttentionSubjects.length > 0
                ? `${weekData.zeroAttentionSubjects.slice(0, 3).join(', ')} received zero study time this week.`
                : 'All primary subjects received balanced revision!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
