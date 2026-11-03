/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SLEEP_REST_TYPES } from '../utils/categories';
import { formatDuration, getDurationForDate, formatISTTime } from '../utils/time';
import { ActivityEntry } from '../types';
import {
  Moon,
  Bed,
  Play,
  Sparkles,
  Edit2,
  Clock,
  Heart,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const SleepTrackerView: React.FC = () => {
  const { entries, todayEntries, goals, startTimer, selectedDate } = useApp();

  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Sleep & rest entries
  const sleepEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'sleep_rest');
  }, [entries]);

  // Total sleep in selected date, including midnight crossing
  const sleepMetrics = useMemo(() => {
    let nightSleepMinutes = 0;
    let napMinutes = 0;
    let restMinutes = 0;
    let totalQuality = 0;
    let qualityCount = 0;

    for (const e of entries) {
      if (e.category === 'sleep_rest') {
        const durationInTargetDate = getDurationForDate(e.startTime, e.endTime, selectedDate);
        if (durationInTargetDate > 0) {
          if (e.subcategory === 'Night sleep') {
            nightSleepMinutes += durationInTargetDate;
          } else if (e.subcategory === 'Afternoon nap' || e.subcategory === 'Power nap') {
            napMinutes += durationInTargetDate;
          } else {
            restMinutes += durationInTargetDate;
          }

          if (e.sleepDetails?.sleepQuality) {
            totalQuality += e.sleepDetails.sleepQuality;
            qualityCount += 1;
          }
        }
      }
    }

    const totalSleepMinutes = nightSleepMinutes + napMinutes;
    const avgQuality = qualityCount > 0 ? Math.round((totalQuality / qualityCount) * 10) / 10 : 0;

    return {
      nightSleepMinutes,
      napMinutes,
      restMinutes,
      totalSleepMinutes,
      avgQuality,
    };
  }, [entries, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Sleep & Rest Architecture
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Deep recovery tracking with midnight boundary calculations, sleep quality ratings, and power naps.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">24h Total Sleep</span>
              <span className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400 block tabular-nums">
                {formatDuration(sleepMetrics.totalSleepMinutes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Sleep Goal</span>
              <span className="font-mono text-xl font-black text-neutral-900 dark:text-neutral-100 block tabular-nums">
                {formatDuration(goals.sleepMinutes || 450)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Avg Quality</span>
              <span className="font-mono text-xl font-black text-amber-500 block tabular-nums">
                {sleepMetrics.avgQuality > 0 ? `${sleepMetrics.avgQuality}/5 ★` : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Midnight crossing explainer */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>
            Night sleep: {formatDuration(sleepMetrics.nightSleepMinutes)} · Daytime naps: {formatDuration(sleepMetrics.napMinutes)} · Rest & Breaks: {formatDuration(sleepMetrics.restMinutes)}
          </span>
          <span className="text-[11px] text-indigo-500 dark:text-indigo-400">
            ✓ Accurate midnight-span calculation active for {selectedDate}
          </span>
        </div>
      </div>

      {/* Sleep Types */}
      <div>
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
          Rest & Sleep Sessions ({SLEEP_REST_TYPES.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SLEEP_REST_TYPES.map((type) => (
            <div
              key={type}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
            >
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {type}
                </h4>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Recovery state
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => startTimer('sleep_rest', type, `${type}`, { isProductive: true })}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep logs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Sleep & Rest History ({sleepEntries.length})
          </h3>
        </div>

        {sleepEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No sleep records logged yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Timestamps (IST)</th>
                  <th className="py-2.5 px-4">Quality & Notes</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {sleepEntries.slice().reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {e.subcategory}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {formatISTTime(e.startTime, false)} &rarr; {formatISTTime(e.endTime, false)}
                    </td>
                    <td className="py-3 px-4">
                      {e.sleepDetails?.sleepQuality && (
                        <span className="font-semibold text-amber-500 mr-2">
                          {e.sleepDetails.sleepQuality}/5 ★
                        </span>
                      )}
                      <span className="text-neutral-500">
                        {e.notes || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums whitespace-nowrap">
                      {formatDuration(e.durationMinutes)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingEntry(e)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingEntry && (
        <EditActivityModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
};
