/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatISTHumanDate,
  formatISTTime,
  getTodayTimeMetrics,
  formatDuration,
  formatStopwatchMs,
} from '../utils/time';
import { CATEGORIES_CONFIG } from '../utils/categories';
import {
  Play,
  Pause,
  Square,
  Clock,
  Zap,
  Target,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const LiveClockHeader: React.FC = () => {
  const {
    currentISTTime,
    todayEntries,
    goals,
    activeTimer,
    timerElapsedMs,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setActiveTab,
  } = useApp();

  const timeMetrics = useMemo(() => {
    return getTodayTimeMetrics();
  }, [currentISTTime]);

  // Aggregate metrics for today
  const dailyStats = useMemo(() => {
    let productiveMinutes = 0;
    let upscStudyMinutes = 0;
    let answerWritingMinutes = 0;
    let wastedMinutes = 0;
    let sleepMinutes = 0;
    let exerciseMinutes = 0;
    let restMinutes = 0;

    for (const entry of todayEntries) {
      if (entry.isProductive) productiveMinutes += entry.durationMinutes;
      if (entry.category === 'upsc_study') upscStudyMinutes += entry.durationMinutes;
      if (entry.category === 'answer_writing') answerWritingMinutes += entry.durationMinutes;
      if (entry.category === 'digital_distraction' && !entry.isProductive) wastedMinutes += entry.durationMinutes;
      if (entry.category === 'sleep_rest') {
        if (entry.subcategory === 'Night sleep' || entry.subcategory === 'Afternoon nap' || entry.subcategory === 'Power nap') {
          sleepMinutes += entry.durationMinutes;
        } else {
          restMinutes += entry.durationMinutes;
        }
      }
      if (entry.category === 'physical_health') exerciseMinutes += entry.durationMinutes;
    }

    const elapsedToday = Math.max(1, timeMetrics.elapsedMinutes);
    const productivityPercent = Math.min(100, Math.round((productiveMinutes / elapsedToday) * 100));

    // Goal completion calculation
    const studyTarget = goals.upscStudyMinutes || 480;
    const studyProgress = Math.min(1, upscStudyMinutes / studyTarget);
    const answersTarget = goals.answerWritingMinutes || 60;
    const answersProgress = Math.min(1, answerWritingMinutes / answersTarget);
    const exerciseTarget = goals.exerciseMinutes || 45;
    const exerciseProgress = Math.min(1, exerciseMinutes / exerciseTarget);

    const goalCompletionPercent = Math.min(
      100,
      Math.round(((studyProgress * 0.5 + answersProgress * 0.25 + exerciseProgress * 0.25) * 100))
    );

    const untrackedMinutes = Math.max(0, elapsedToday - (productiveMinutes + wastedMinutes + (sleepMinutes > elapsedToday ? 0 : 0)));

    return {
      productiveMinutes,
      upscStudyMinutes,
      wastedMinutes,
      sleepMinutes,
      exerciseMinutes,
      restMinutes,
      untrackedMinutes,
      productivityPercent,
      goalCompletionPercent,
    };
  }, [todayEntries, timeMetrics.elapsedMinutes, goals]);

  const activeCategoryMeta = activeTimer ? CATEGORIES_CONFIG[activeTimer.category] : null;

  return (
    <section className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top strip: IST Time, Date, Day Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Clock & Date */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 tabular-nums">
                {currentISTTime}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                IST (24-Hour)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
              <span>{formatISTHumanDate()}</span>
              <span aria-hidden="true">·</span>
              <span>Asia/Kolkata</span>
            </div>

            {/* Day elapsed progress bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                <span className="font-medium">
                  {formatDuration(timeMetrics.elapsedMinutes)} elapsed
                </span>
                <span className="font-mono tabular-nums text-neutral-400">
                  {formatDuration(timeMetrics.remainingMinutes)} left ({100 - timeMetrics.elapsedPercent}%)
                </span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-neutral-900 dark:bg-neutral-200 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${timeMetrics.elapsedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Productivity & Goals Gauges */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <span>Productivity</span>
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {dailyStats.productivityPercent}%
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {formatDuration(dailyStats.productiveMinutes)} tracked
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <span>Study Target</span>
                <Target className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {formatDuration(dailyStats.upscStudyMinutes)}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Goal: {formatDuration(goals.upscStudyMinutes)}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <span>Goal Met</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {dailyStats.goalCompletionPercent}%
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Study & answer targets
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <span>Wasted Time</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`font-mono text-2xl font-bold tabular-nums ${
                  dailyStats.wastedMinutes > (goals.maxDistractionMinutes || 30)
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-neutral-900 dark:text-neutral-100'
                }`}>
                  {formatDuration(dailyStats.wastedMinutes)}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Limit: {goals.maxDistractionMinutes}m
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Indicator Banner */}
        <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800">
          {activeTimer && activeTimer.isActive ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Currently Doing
                    </span>
                    <span aria-hidden="true" className="text-neutral-400">·</span>
                    <span className="text-neutral-600 dark:text-neutral-300 font-medium">
                      {activeCategoryMeta?.name}
                    </span>
                    <span aria-hidden="true" className="text-neutral-400">·</span>
                    <span className="text-neutral-500">
                      Started at {formatISTTime(activeTimer.startTime, false)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50 mt-0.5">
                    {activeTimer.title || activeTimer.subcategory}
                  </h3>
                </div>
              </div>

              {/* Live duration & Controls */}
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
                    Duration
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatStopwatchMs(timerElapsedMs)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTimer.isPaused ? (
                    <button
                      onClick={resumeTimer}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="flex items-center gap-1.5 px-3 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}
                  <button
                    onClick={() => stopTimer()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop & Save</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  No active timer running.
                </span>
                <span>Track your next session to keep zero untracked minutes.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('timer')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded cursor-pointer transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start New Timer</span>
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <span>Open 24h Timeline &rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
