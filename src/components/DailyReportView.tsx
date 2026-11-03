/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatDuration,
  getDurationForDate,
  formatISTHumanDate,
  istDateTimeToEpoch,
} from '../utils/time';
import { CATEGORIES_CONFIG } from '../utils/categories';
import {
  Award,
  AlertTriangle,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DailyReportView: React.FC = () => {
  const {
    entries,
    selectedDate,
    setSelectedDate,
    todayDateStr,
    goals,
  } = useApp();

  const changeDateBy = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
    const yr = dateObj.getUTCFullYear();
    const mo = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const dt = String(dateObj.getUTCDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dt}`);
  };

  // Day entries & calculations
  const report = useMemo(() => {
    let productiveMinutes = 0;
    let upscStudyMinutes = 0;
    let answerWritingMinutes = 0;
    let englishMinutes = 0;
    let exerciseMinutes = 0;
    let walkingMinutes = 0;
    let meditationMinutes = 0;
    let sunlightMinutes = 0;
    let sleepMinutes = 0;
    let eatingMinutes = 0;
    let hygieneMinutes = 0;
    let restMinutes = 0;
    let wastedMinutes = 0;

    const subjectBreakdown: Record<string, number> = {};
    const distractionBreakdown: Record<string, number> = {};

    for (const e of entries) {
      const dur = getDurationForDate(e.startTime, e.endTime, selectedDate);
      if (dur <= 0) continue;

      if (e.isProductive) productiveMinutes += dur;

      if (e.category === 'upsc_study') {
        upscStudyMinutes += dur;
        subjectBreakdown[e.subcategory] = (subjectBreakdown[e.subcategory] || 0) + dur;
      }
      if (e.category === 'answer_writing') {
        answerWritingMinutes += dur;
      }
      if (e.category === 'english_skills') {
        englishMinutes += dur;
      }
      if (e.category === 'physical_health') {
        exerciseMinutes += dur;
        if (e.subcategory === 'Walking' || e.subcategory === 'Walking in nature') {
          walkingMinutes += dur;
        }
        if (e.subcategory === 'Meditation' || e.subcategory === 'Breathing exercises') {
          meditationMinutes += dur;
        }
        if (e.subcategory === 'Sunlight exposure' || e.subcategory === 'Touch grass/outdoor time') {
          sunlightMinutes += dur;
        }
      }
      if (e.category === 'sleep_rest') {
        if (e.subcategory === 'Night sleep' || e.subcategory === 'Afternoon nap' || e.subcategory === 'Power nap') {
          sleepMinutes += dur;
        } else {
          restMinutes += dur;
        }
      }
      if (e.category === 'food_eating') {
        eatingMinutes += dur;
      }
      if (e.category === 'hygiene') {
        hygieneMinutes += dur;
      }
      if (e.category === 'digital_distraction') {
        if (!e.isProductive) {
          wastedMinutes += dur;
          distractionBreakdown[e.subcategory] = (distractionBreakdown[e.subcategory] || 0) + dur;
        }
      }
    }

    const totalTrackedMinutes = productiveMinutes + wastedMinutes + (sleepMinutes > 0 ? 0 : 0);
    const untrackedMinutes = Math.max(0, 1440 - (productiveMinutes + wastedMinutes));

    // Insights: Most productive subject
    let mostProductiveSubject = 'None';
    let maxSubMinutes = 0;
    for (const [sub, mins] of Object.entries(subjectBreakdown)) {
      if (mins > maxSubMinutes) {
        maxSubMinutes = mins;
        mostProductiveSubject = sub;
      }
    }

    // Biggest distraction
    let biggestDistraction = 'None';
    let maxDistMins = 0;
    for (const [dist, mins] of Object.entries(distractionBreakdown)) {
      if (mins > maxDistMins) {
        maxDistMins = mins;
        biggestDistraction = dist;
      }
    }

    // Goal completion
    const studyTarget = goals.upscStudyMinutes || 480;
    const answersTarget = goals.answerWritingMinutes || 60;
    const englishTarget = goals.englishMinutes || 30;
    const exerciseTarget = goals.exerciseMinutes || 45;

    const studyScore = Math.min(1, upscStudyMinutes / studyTarget);
    const answersScore = Math.min(1, answerWritingMinutes / answersTarget);
    const englishScore = Math.min(1, englishMinutes / englishTarget);
    const exerciseScore = Math.min(1, exerciseMinutes / exerciseTarget);

    const goalCompletionPct = Math.min(100, Math.round(((studyScore + answersScore + englishScore + exerciseScore) / 4) * 100));

    // Best achievement
    let bestAchievement = 'Consistency in schedule';
    if (upscStudyMinutes >= studyTarget && answerWritingMinutes >= answersTarget) {
      bestAchievement = `Exceeded primary UPSC targets: ${formatDuration(upscStudyMinutes)} study & ${formatDuration(answerWritingMinutes)} answer writing`;
    } else if (upscStudyMinutes >= studyTarget) {
      bestAchievement = `Reached 8-Hour UPSC study target (${formatDuration(upscStudyMinutes)})`;
    } else if (productiveMinutes > 600) {
      bestAchievement = `High focus day with over ${formatDuration(productiveMinutes)} productive work`;
    }

    // Activities needing improvement
    const needsImprovement: string[] = [];
    if (wastedMinutes > (goals.maxDistractionMinutes || 30)) {
      needsImprovement.push(`Distraction reduction (${formatDuration(wastedMinutes)} wasted, limit was ${goals.maxDistractionMinutes || 30}m)`);
    }
    if (upscStudyMinutes < studyTarget) {
      needsImprovement.push(`UPSC Study volume (${formatDuration(studyTarget - upscStudyMinutes)} below 8h target)`);
    }
    if (answerWritingMinutes < answersTarget) {
      needsImprovement.push(`Daily answer writing practice (${formatDuration(answersTarget - answerWritingMinutes)} remaining)`);
    }
    if (exerciseMinutes < exerciseTarget) {
      needsImprovement.push(`Physical exercise and sunlight exposure`);
    }
    if (untrackedMinutes > 180) {
      needsImprovement.push(`Time gap tracking (${formatDuration(untrackedMinutes)} remained untracked)`);
    }

    return {
      productiveMinutes,
      upscStudyMinutes,
      subjectBreakdown,
      answerWritingMinutes,
      englishMinutes,
      exerciseMinutes,
      walkingMinutes,
      meditationMinutes,
      sunlightMinutes,
      sleepMinutes,
      eatingMinutes,
      hygieneMinutes,
      restMinutes,
      wastedMinutes,
      untrackedMinutes,
      mostProductiveSubject,
      maxSubMinutes,
      biggestDistraction,
      maxDistMins,
      goalCompletionPct,
      bestAchievement,
      needsImprovement,
    };
  }, [entries, selectedDate, goals]);

  // Selected date human text
  const [sy, sm, sd] = selectedDate.split('-').map(Number);
  const selectedEpoch = Date.UTC(sy, sm - 1, sd, 12, 0, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Date Header */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Daily Comprehensive Audit
          </span>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatISTHumanDate(selectedEpoch)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(todayDateStr)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => changeDateBy(1)}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 font-mono"
          />
        </div>
      </div>

      {/* Key Highlights: Best Achievement & Biggest Distraction */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Best Achievement of the Day</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {report.bestAchievement}
          </p>
          <div className="mt-3 text-xs text-neutral-500">
            Most productive subject: <span className="font-semibold text-blue-600 dark:text-blue-400">{report.mostProductiveSubject}</span> ({formatDuration(report.maxSubMinutes)})
          </div>
        </div>

        <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-50/30 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Biggest Distraction</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {report.biggestDistraction !== 'None' ? `${report.biggestDistraction} (${formatDuration(report.maxDistMins)})` : 'Zero digital distractions recorded today!'}
          </p>
          <div className="mt-3 text-xs text-neutral-500">
            Goal Completion Score: <span className="font-semibold text-amber-500">{report.goalCompletionPct}%</span>
          </div>
        </div>
      </div>

      {/* Complete 15-Item Breakdown Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Complete Daily Activity Breakdown (24 Hours)
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Every category measured in exact minutes for {selectedDate}.
          </p>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
          <div className="p-3.5 flex justify-between items-center bg-blue-50/30 dark:bg-blue-950/20 font-bold">
            <span className="text-blue-700 dark:text-blue-300">Total Productive Time</span>
            <span className="font-mono text-sm tabular-nums text-blue-700 dark:text-blue-300">
              {formatDuration(report.productiveMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">1. Total UPSC Study Time</span>
            <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatDuration(report.upscStudyMinutes)}
            </span>
          </div>

          {/* Subject wise nested list if any */}
          {Object.keys(report.subjectBreakdown).length > 0 && (
            <div className="p-3 bg-neutral-50/50 dark:bg-neutral-950/40 pl-10 space-y-1 text-[11px] text-neutral-500">
              {Object.entries(report.subjectBreakdown).map(([sub, mins]) => (
                <div key={sub} className="flex justify-between">
                  <span>• {sub}</span>
                  <span className="font-mono tabular-nums">{formatDuration(mins)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">2. Answer-Writing Practice</span>
            <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatDuration(report.answerWritingMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">3. English Skills Practice</span>
            <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatDuration(report.englishMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">4. Physical Exercise & Gym</span>
            <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatDuration(report.exerciseMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-10 text-[11px] text-neutral-500">
            <span>• Walking / Walking in nature</span>
            <span className="font-mono tabular-nums">{formatDuration(report.walkingMinutes)}</span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-10 text-[11px] text-neutral-500">
            <span>• Meditation & Breathing</span>
            <span className="font-mono tabular-nums">{formatDuration(report.meditationMinutes)}</span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-10 text-[11px] text-neutral-500">
            <span>• Sunlight & Touch Grass / Outdoor</span>
            <span className="font-mono tabular-nums">{formatDuration(report.sunlightMinutes)}</span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">5. Sleep (Night Sleep & Naps)</span>
            <span className="font-mono font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              {formatDuration(report.sleepMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">6. Eating & Nutrition</span>
            <span className="font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {formatDuration(report.eatingMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">7. Personal Hygiene & Grooming</span>
            <span className="font-mono font-bold tabular-nums text-cyan-600 dark:text-cyan-400">
              {formatDuration(report.hygieneMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6">
            <span className="text-neutral-700 dark:text-neutral-300">8. Rest & Relaxation Breaks</span>
            <span className="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatDuration(report.restMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6 bg-rose-50/20 dark:bg-rose-950/10">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">9. Digital Distractions & Wasted Time</span>
            <span className="font-mono font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {formatDuration(report.wastedMinutes)}
            </span>
          </div>

          <div className="p-3.5 flex justify-between items-center pl-6 bg-neutral-100/50 dark:bg-neutral-950/50">
            <span className="text-neutral-500 font-semibold">10. Untracked Time Gaps</span>
            <span className="font-mono font-bold tabular-nums text-neutral-500">
              {formatDuration(report.untrackedMinutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Areas Needing Improvement */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-2">
          Diagnostic Audit: Areas Needing Improvement
        </h3>
        {report.needsImprovement.length === 0 ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Outstanding! All target quotas and habit milestones were satisfied with minimal wasted time.
          </p>
        ) : (
          <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            {report.needsImprovement.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
