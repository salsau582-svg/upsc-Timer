/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DISTRACTION_PLATFORMS } from '../utils/categories';
import { formatDuration } from '../utils/time';
import { ActivityEntry } from '../types';
import {
  Smartphone,
  AlertTriangle,
  Play,
  CheckCircle,
  TrendingDown,
  Edit2,
  PieChart,
} from 'lucide-react';
import { EditActivityModal } from './EditActivityModal';

export const DistractionTrackerView: React.FC = () => {
  const { entries, todayEntries, goals, startTimer } = useApp();

  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Distraction entries
  const distractionEntries = useMemo(() => {
    return entries.filter((e) => e.category === 'digital_distraction');
  }, [entries]);

  // Analytics: Platform totals, today's wasted vs productive, biggest distraction
  const analytics = useMemo(() => {
    let todayWastedMinutes = 0;
    let todayProductiveSocialMinutes = 0;
    let allTimeWastedMinutes = 0;

    const platformMinutes: Record<string, number> = {};
    for (const p of DISTRACTION_PLATFORMS) {
      platformMinutes[p] = 0;
    }

    for (const e of distractionEntries) {
      const isUnproductive = !e.isProductive;
      if (isUnproductive) {
        allTimeWastedMinutes += e.durationMinutes;
        platformMinutes[e.subcategory] = (platformMinutes[e.subcategory] || 0) + e.durationMinutes;
      }

      if (todayEntries.some((te) => te.id === e.id)) {
        if (isUnproductive) {
          todayWastedMinutes += e.durationMinutes;
        } else {
          todayProductiveSocialMinutes += e.durationMinutes;
        }
      }
    }

    // Identify biggest distraction
    let biggestPlatform = 'None';
    let maxMinutes = 0;
    for (const [p, mins] of Object.entries(platformMinutes)) {
      if (mins > maxMinutes) {
        maxMinutes = mins;
        biggestPlatform = p;
      }
    }

    return {
      todayWastedMinutes,
      todayProductiveSocialMinutes,
      allTimeWastedMinutes,
      biggestPlatform,
      maxMinutes,
      platformMinutes,
    };
  }, [distractionEntries, todayEntries]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Digital Distraction & Screen Audit
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Honest time-logging of phone and social media use. Distinguish UPSC educational research from rabbit-hole scrolling.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Today Wasted</span>
              <span className={`font-mono text-xl font-black block tabular-nums ${
                analytics.todayWastedMinutes > (goals.maxDistractionMinutes || 30) ? 'text-rose-500' : 'text-neutral-900 dark:text-neutral-100'
              }`}>
                {formatDuration(analytics.todayWastedMinutes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Daily Limit</span>
              <span className="font-mono text-xl font-black text-neutral-900 dark:text-neutral-100 block tabular-nums">
                {goals.maxDistractionMinutes || 30}m
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Biggest Culprit</span>
              <span className="font-mono text-xl font-black text-rose-600 dark:text-rose-400 block truncate max-w-[120px]">
                {analytics.biggestPlatform}
              </span>
            </div>
          </div>
        </div>

        {/* Warning if exceeded */}
        {analytics.todayWastedMinutes > (goals.maxDistractionMinutes || 30) && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Alert: You have exceeded your daily limit by {formatDuration(analytics.todayWastedMinutes - (goals.maxDistractionMinutes || 30))}. Put your phone on focus mode now!
            </span>
          </div>
        )}
      </div>

      {/* Platform Launch Grid */}
      <div>
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
          Apps & Platforms ({DISTRACTION_PLATFORMS.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {DISTRACTION_PLATFORMS.map((platform) => {
            const wastedMins = analytics.platformMinutes[platform] || 0;
            return (
              <div
                key={platform}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-rose-500/40 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {platform}
                  </h4>
                  <span className="text-[11px] font-mono text-neutral-400 block mt-1 tabular-nums">
                    All-time wasted: {formatDuration(wastedMins)}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => startTimer('digital_distraction', platform, `${platform} Usage`, { isProductive: false })}
                    className="w-full flex items-center justify-center gap-1 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Track Usage</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Screen Usage Logs ({distractionEntries.length})
          </h3>
        </div>

        {distractionEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No distraction logs recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Platform</th>
                  <th className="py-2.5 px-4">Classification</th>
                  <th className="py-2.5 px-4">Usage Reason</th>
                  <th className="py-2.5 px-4 text-right">Duration</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                {distractionEntries.slice().reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30">
                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {e.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {e.subcategory}
                    </td>
                    <td className="py-3 px-4">
                      {e.isProductive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-medium">
                          Productive / UPSC Study
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-500 font-medium">
                          Wasted Time
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {e.distractionDetails?.usageReason || e.notes || e.title}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
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
